"""Register card static files and Lovelace resource.

index.js is a self-contained bundle (no relative imports).
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import Event, HomeAssistant, ServiceCall, callback
from homeassistant.helpers.event import async_call_later

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

URL_BASE = f"/{DOMAIN}_files"
CARD_URL = f"{URL_BASE}/index.js"
CARD_URL_VERSIONED = f"{CARD_URL}?v={VERSION}"

_registered_path = False
_extra_js_added = False


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Serve www/ and register the card module + Lovelace resource."""
    global _registered_path, _extra_js_added

    src = Path(__file__).resolve().parent / "www"
    if not (src / "index.js").is_file():
        _LOGGER.error("Card missing: %s/index.js", src)
        return

    if not _registered_path:
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(URL_BASE, str(src), False)]
            )
            _registered_path = True
            _LOGGER.warning("SD static path %s → %s", URL_BASE, src)
        except Exception as err:
            if "already" in str(err).lower() or "exists" in str(err).lower():
                _registered_path = True
            else:
                _LOGGER.exception("SD static path failed: %s", err)
                return

    if not _extra_js_added:
        try:
            add_extra_js_url(hass, CARD_URL_VERSIONED)
            _extra_js_added = True
            _LOGGER.warning("SD module injected: %s", CARD_URL_VERSIONED)
        except Exception as err:
            _LOGGER.exception("SD add_extra_js_url failed: %s", err)

    # Service to force resource registration (call from Developer Tools)
    if not hass.services.has_service(DOMAIN, "register_card"):

        async def _handle_register(_call: ServiceCall) -> None:
            ok = await _async_ensure_resource(hass)
            _LOGGER.warning("SD register_card service result: %s", ok)

        hass.services.async_register(DOMAIN, "register_card", _handle_register)

    async def _ensure(_now=None) -> None:
        await _async_ensure_resource(hass)

    if hass.is_running:
        async_call_later(hass, 2, lambda now: hass.async_create_task(_ensure()))
        async_call_later(hass, 10, lambda now: hass.async_create_task(_ensure()))
        async_call_later(hass, 30, lambda now: hass.async_create_task(_ensure()))
    else:

        async def _on_start(_event: Event) -> None:
            async_call_later(hass, 3, lambda now: hass.async_create_task(_ensure()))
            async_call_later(hass, 15, lambda now: hass.async_create_task(_ensure()))

        hass.bus.async_listen_once("homeassistant_started", _on_start)


def _get_resources(hass: HomeAssistant):
    try:
        from homeassistant.components.lovelace.const import LOVELACE_DATA

        data = hass.data.get(LOVELACE_DATA)
        if data is not None and hasattr(data, "resources"):
            return data.resources
    except Exception:
        pass

    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None
    if hasattr(lovelace, "resources"):
        return lovelace.resources
    if isinstance(lovelace, dict):
        return lovelace.get("resources")
    return None


async def _async_ensure_resource(hass: HomeAssistant) -> str:
    """Create/update resource. Returns status string."""
    resources = _get_resources(hass)
    if resources is None:
        _LOGGER.warning(
            "SD: Lovelace resources unavailable. Add manually: %s (JavaScript Module)",
            CARD_URL_VERSIONED,
        )
        return "no_lovelace"

    if not hasattr(resources, "async_create_item"):
        _LOGGER.warning(
            "SD: YAML resource mode — add manually:\n"
            "  resources:\n"
            "    - url: %s\n"
            "      type: module",
            CARD_URL_VERSIONED,
        )
        return "yaml"

    try:
        if hasattr(resources, "async_load") and not getattr(resources, "loaded", True):
            await resources.async_load()
            if hasattr(resources, "loaded"):
                resources.loaded = True
    except Exception as err:
        _LOGGER.debug("SD async_load: %s", err)

    try:
        items = list(resources.async_items()) if hasattr(resources, "async_items") else []
    except Exception as err:
        _LOGGER.warning("SD async_items failed: %s", err)
        items = []

    target = CARD_URL_VERSIONED
    found_id = None
    found_url = None
    for item in items:
        if not isinstance(item, dict):
            continue
        url = str(item.get("url") or "")
        if "/smart_dehumidifier_files/" in url or "smart_dehumidifier" in url:
            found_id = item.get("id")
            found_url = url
            break

    if found_url == target:
        _LOGGER.warning("SD resource OK: %s", target)
        return "ok"

    payload = {"res_type": "module", "url": target}

    if found_id is not None and hasattr(resources, "async_update_item"):
        try:
            await resources.async_update_item(found_id, payload)
            _LOGGER.warning("SD resource UPDATED: %s → %s", found_url, target)
            return "updated"
        except Exception as err:
            _LOGGER.warning("SD update failed: %s", err)

    try:
        await resources.async_create_item(payload)
        _LOGGER.warning("SD resource CREATED: %s", target)
        return "created"
    except Exception as err:
        _LOGGER.warning(
            "SD create failed (%s). Add manually in Resources: %s (JavaScript Module)",
            err,
            target,
        )
        return f"error:{err}"
