"""Serve Lovelace card + auto-register/update resource with ?v=VERSION.

Restored from working v1.5.2 logic (static path + Lovelace resource create/update).
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.core import Event, HomeAssistant
from homeassistant.helpers.event import async_call_later

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

URL_BASE = f"/{DOMAIN}_files"
CARD_URL = f"{URL_BASE}/index.js"
CARD_URL_VERSIONED = f"{CARD_URL}?v={VERSION}"

_registered_path = False


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register static path and ensure Lovelace resource has current ?v=."""
    global _registered_path

    src = Path(__file__).resolve().parent / "www"
    if not src.is_dir() or not (src / "index.js").is_file():
        _LOGGER.error("Card www/ missing at %s", src)
        return

    if not _registered_path:
        try:
            from homeassistant.components.http import StaticPathConfig

            await hass.http.async_register_static_paths(
                [StaticPathConfig(URL_BASE, str(src), False)]
            )
            _registered_path = True
            _LOGGER.warning("SD card static path %s → %s", URL_BASE, src)
        except Exception as err:
            if "already" in str(err).lower() or "exists" in str(err).lower():
                _registered_path = True
            else:
                _LOGGER.exception("Static path failed: %s", err)
                return

    async def _ensure(_now=None) -> None:
        await _async_ensure_resource(hass)

    # Same timing as v1.5.2
    if hass.is_running:
        async_call_later(hass, 2, lambda now: hass.async_create_task(_ensure()))
        async_call_later(hass, 15, lambda now: hass.async_create_task(_ensure()))
    else:

        async def _on_start(_event: Event) -> None:
            async_call_later(hass, 5, lambda now: hass.async_create_task(_ensure()))

        hass.bus.async_listen_once("homeassistant_started", _on_start)


async def _async_ensure_resource(hass: HomeAssistant) -> None:
    """Create or UPDATE Lovelace resource to CARD_URL_VERSIONED (v1.5.2 logic)."""
    resources = _find_resources(hass)
    if resources is None:
        _LOGGER.warning(
            "Add Lovelace resource manually: %s (JavaScript Module)",
            CARD_URL_VERSIONED,
        )
        return

    try:
        if hasattr(resources, "async_load"):
            await resources.async_load()
    except Exception:
        pass

    try:
        items = list(resources.async_items()) if hasattr(resources, "async_items") else []
    except Exception:
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
        _LOGGER.info("SD card resource OK: %s", target)
        return

    if found_id is not None and hasattr(resources, "async_update_item"):
        try:
            await resources.async_update_item(
                found_id, {"res_type": "module", "url": target}
            )
            _LOGGER.warning("SD card resource UPDATED: %s → %s", found_url, target)
            return
        except Exception as err:
            _LOGGER.warning("Resource update failed (%s), try create", err)

    if found_url is None:
        try:
            await resources.async_create_item({"res_type": "module", "url": target})
            _LOGGER.warning("SD card resource CREATED: %s", target)
            return
        except Exception as err:
            _LOGGER.warning(
                "Could not create resource (%s). Add manually: %s",
                err,
                target,
            )
            return

    if found_url != target:
        try:
            await resources.async_create_item({"res_type": "module", "url": target})
            _LOGGER.warning("SD card resource added (old left): %s", target)
        except Exception as err:
            _LOGGER.warning("Add resource manually: %s (%s)", target, err)


def _find_resources(hass: HomeAssistant):
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None
    res = getattr(lovelace, "resources", None)
    if res is not None and hasattr(res, "async_create_item"):
        return res
    if isinstance(lovelace, dict):
        for val in lovelace.values():
            r = getattr(val, "resources", None)
            if r is not None and hasattr(r, "async_create_item"):
                return r
            if hasattr(val, "async_create_item"):
                return val
    return None
