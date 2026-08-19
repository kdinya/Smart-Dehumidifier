"""Card registration — same URL scheme as working v1.5.2.

URL: /smart_dehumidifier_files/index.js?v=VERSION
index.js is self-contained (full bundle, no relative imports).
Also copies to /local as fallback and updates any old resource entry
(including ?v=1.5.2).
"""

from __future__ import annotations

import logging
import shutil
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import Event, HomeAssistant, ServiceCall
from homeassistant.helpers.event import async_call_later

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

URL_BASE = f"/{DOMAIN}_files"
CARD_URL = f"{URL_BASE}/index.js"
CARD_URL_VERSIONED = f"{CARD_URL}?v={VERSION}"

_registered_path = False


async def async_register_frontend(hass: HomeAssistant) -> None:
    global _registered_path

    src = Path(__file__).resolve().parent / "www"
    index_js = src / "index.js"
    if not index_js.is_file():
        _LOGGER.error("SD missing card: %s", index_js)
        return

    # 1) Same static path as v1.5.2 — /smart_dehumidifier_files/
    if not _registered_path:
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(URL_BASE, str(src), False)]
            )
            _registered_path = True
            _LOGGER.warning("SD static path: %s → %s", URL_BASE, src)
        except Exception as err:
            if "already" in str(err).lower() or "exists" in str(err).lower():
                _registered_path = True
            else:
                _LOGGER.exception("SD static path failed: %s", err)

    # 2) Also copy to /local as backup
    dest_dir = Path(hass.config.path("www", "smart_dehumidifier"))
    dest_file = dest_dir / "index.js"

    def _copy() -> None:
        dest_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(index_js, dest_file)

    try:
        await hass.async_add_executor_job(_copy)
        _LOGGER.warning("SD also copied to %s", dest_file)
    except Exception as err:
        _LOGGER.warning("SD /local copy failed: %s", err)

    if not hass.services.has_service(DOMAIN, "register_card"):

        async def _handle_register(_call: ServiceCall) -> None:
            try:
                await hass.async_add_executor_job(_copy)
            except Exception:
                pass
            await _inject(hass)
            result = await _ensure_resource(hass)
            _LOGGER.warning("SD register_card → %s | %s", result, CARD_URL_VERSIONED)

        hass.services.async_register(DOMAIN, "register_card", _handle_register)

    async def _boot(_now=None) -> None:
        await _inject(hass)
        result = await _ensure_resource(hass)
        _LOGGER.warning("SD boot → %s | %s", result, CARD_URL_VERSIONED)
        if result not in ("ok", "updated", "created"):
            await _notify(hass)

    if hass.is_running:
        async_call_later(hass, 3, lambda now: hass.async_create_task(_boot()))
        async_call_later(hass, 15, lambda now: hass.async_create_task(_boot()))
    else:

        async def _on_start(_event: Event) -> None:
            async_call_later(hass, 3, lambda now: hass.async_create_task(_boot()))
            async_call_later(hass, 15, lambda now: hass.async_create_task(_boot()))

        hass.bus.async_listen_once("homeassistant_started", _on_start)


async def _inject(hass: HomeAssistant) -> None:
    try:
        from homeassistant.components.frontend import (
            DATA_EXTRA_MODULE_URL,
            add_extra_js_url,
        )

        if DATA_EXTRA_MODULE_URL not in hass.data:
            _LOGGER.warning("SD frontend not ready")
            return
        # Inject both paths — old scheme + /local fallback
        add_extra_js_url(hass, CARD_URL_VERSIONED)
        add_extra_js_url(hass, f"/local/smart_dehumidifier/index.js?v={VERSION}")
        _LOGGER.warning("SD modules injected")
    except Exception as err:
        _LOGGER.exception("SD inject failed: %s", err)


def _get_resources(hass: HomeAssistant):
    try:
        from homeassistant.components.lovelace.const import LOVELACE_DATA

        data = hass.data.get(LOVELACE_DATA)
        if data is not None:
            return getattr(data, "resources", None)
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


async def _ensure_resource(hass: HomeAssistant) -> str:
    resources = _get_resources(hass)
    if resources is None:
        return "no_lovelace"
    if not hasattr(resources, "async_create_item"):
        return "yaml_mode"

    try:
        if hasattr(resources, "async_load") and not getattr(resources, "loaded", False):
            await resources.async_load()
            if hasattr(resources, "loaded"):
                resources.loaded = True
    except Exception:
        pass

    try:
        items = list(resources.async_items()) if hasattr(resources, "async_items") else []
    except Exception as err:
        _LOGGER.warning("SD async_items: %s", err)
        items = []

    target = CARD_URL_VERSIONED
    found_id = None
    found_url = None

    for item in items:
        if not isinstance(item, dict):
            continue
        url = str(item.get("url") or "")
        if (
            "smart_dehumidifier" in url
            or "smart-dehumidifier" in url
            or "/smart_dehumidifier_files/" in url
            or "/local/smart_dehumidifier/" in url
        ):
            found_id = item.get("id")
            found_url = url
            break

    if found_url == target:
        return "ok"

    payload = {"res_type": "module", "url": target}

    # Update old entry (e.g. ?v=1.5.2) to current version
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
        _LOGGER.warning("SD create failed: %s", err)
        return f"error:{err}"


async def _notify(hass: HomeAssistant) -> None:
    try:
        await hass.services.async_call(
            "persistent_notification",
            "create",
            {
                "notification_id": "smart_dehumidifier_card",
                "title": "Smart Dehumidifier card",
                "message": (
                    f"Онови або додай ресурс:\n"
                    f"`{CARD_URL_VERSIONED}`\n"
                    f"Type: JavaScript Module\n"
                    f"Потім Ctrl+F5."
                ),
            },
            blocking=False,
        )
    except Exception:
        pass
