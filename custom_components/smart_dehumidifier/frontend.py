"""Install Lovelace card the reliable way used by most HA cards.

1. Copy self-contained index.js into config/www/smart_dehumidifier/
   → available at /local/smart_dehumidifier/index.js (built-in HA path)
2. add_extra_js_url so frontend loads the module
3. Create/update Lovelace Resources entry for the same URL
"""

from __future__ import annotations

import logging
import shutil
from pathlib import Path

from homeassistant.core import Event, HomeAssistant, ServiceCall
from homeassistant.helpers.event import async_call_later

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

# /local/... maps to <config>/www/...  — always works, no StaticPathConfig needed
LOCAL_DIR_NAME = "smart_dehumidifier"
LOCAL_CARD_PATH = f"/local/{LOCAL_DIR_NAME}/index.js"
CARD_URL_VERSIONED = f"{LOCAL_CARD_PATH}?v={VERSION}"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Copy card to /local and register it."""
    src_index = Path(__file__).resolve().parent / "www" / "index.js"
    if not src_index.is_file():
        _LOGGER.error("SD card source missing: %s", src_index)
        return

    dest_dir = Path(hass.config.path("www", LOCAL_DIR_NAME))
    dest_index = dest_dir / "index.js"

    def _copy() -> None:
        dest_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src_index, dest_index)

    try:
        await hass.async_add_executor_job(_copy)
        _LOGGER.warning("SD card installed to %s", dest_index)
    except Exception as err:
        _LOGGER.exception("SD failed to copy card to www: %s", err)
        return

    if not hass.services.has_service(DOMAIN, "register_card"):

        async def _handle_register(_call: ServiceCall) -> None:
            await hass.async_add_executor_job(_copy)
            await _inject_module(hass)
            result = await _ensure_resource(hass)
            _LOGGER.warning("SD register_card → %s | %s", result, CARD_URL_VERSIONED)
            if result not in ("ok", "updated", "created"):
                await _notify_manual(hass)

        hass.services.async_register(DOMAIN, "register_card", _handle_register)

    async def _boot(_now=None) -> None:
        await _inject_module(hass)
        result = await _ensure_resource(hass)
        _LOGGER.warning("SD card register → %s | %s", result, CARD_URL_VERSIONED)
        if result not in ("ok", "updated", "created"):
            await _notify_manual(hass)

    if hass.is_running:
        async_call_later(hass, 3, lambda now: hass.async_create_task(_boot()))
        async_call_later(hass, 15, lambda now: hass.async_create_task(_boot()))
    else:

        async def _on_start(_event: Event) -> None:
            async_call_later(hass, 3, lambda now: hass.async_create_task(_boot()))
            async_call_later(hass, 15, lambda now: hass.async_create_task(_boot()))

        hass.bus.async_listen_once("homeassistant_started", _on_start)


async def _inject_module(hass: HomeAssistant) -> bool:
    try:
        from homeassistant.components.frontend import (
            DATA_EXTRA_MODULE_URL,
            add_extra_js_url,
        )
    except Exception as err:
        _LOGGER.warning("SD frontend import: %s", err)
        return False

    if DATA_EXTRA_MODULE_URL not in hass.data:
        _LOGGER.warning("SD frontend UrlManager not ready")
        return False

    try:
        add_extra_js_url(hass, CARD_URL_VERSIONED)
        _LOGGER.warning("SD module injected: %s", CARD_URL_VERSIONED)
        return True
    except Exception as err:
        _LOGGER.exception("SD add_extra_js_url failed: %s", err)
        return False


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
    except Exception as err:
        _LOGGER.debug("SD resource load: %s", err)

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
        # Match old and new URLs
        if (
            "smart_dehumidifier" in url
            or "smart-dehumidifier" in url
            or "/local/smart_dehumidifier/" in url
            or "/smart_dehumidifier_files/" in url
        ):
            found_id = item.get("id")
            found_url = url
            break

    if found_url == target:
        return "ok"

    payload = {"res_type": "module", "url": target}

    if found_id is not None and hasattr(resources, "async_update_item"):
        try:
            await resources.async_update_item(found_id, payload)
            _LOGGER.warning("SD resource UPDATED: %s → %s", found_url, target)
            return "updated"
        except Exception as err:
            _LOGGER.warning("SD resource update failed: %s", err)

    try:
        await resources.async_create_item(payload)
        _LOGGER.warning("SD resource CREATED: %s", target)
        return "created"
    except Exception as err:
        _LOGGER.warning("SD resource create failed: %s", err)
        return f"error:{err}"


async def _notify_manual(hass: HomeAssistant) -> None:
    try:
        await hass.services.async_call(
            "persistent_notification",
            "create",
            {
                "notification_id": "smart_dehumidifier_card",
                "title": "Smart Dehumidifier — додайте ресурс картки",
                "message": (
                    f"Додай в **Settings → Dashboards → Resources**:\n\n"
                    f"URL: `{CARD_URL_VERSIONED}`\n"
                    f"Type: **JavaScript Module**\n\n"
                    f"Потім Ctrl+F5.\n"
                    f"Файл має відкриватись: `{CARD_URL_VERSIONED}`"
                ),
            },
            blocking=False,
        )
    except Exception:
        pass
