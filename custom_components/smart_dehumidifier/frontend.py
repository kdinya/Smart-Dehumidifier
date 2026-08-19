"""Register Smart Dehumidifier Lovelace card.

Order matters on HA 2025/2026:
1. Static path (always)
2. After frontend is ready → add_extra_js_url
3. After lovelace is ready → create Resources entry
4. If create fails → persistent notification with manual URL
"""

from __future__ import annotations

import logging
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
    """Register static files and schedule JS/resource registration."""
    global _registered_path

    src = Path(__file__).resolve().parent / "www"
    index_js = src / "index.js"
    if not index_js.is_file():
        _LOGGER.error("SD card file missing: %s", index_js)
        return

    # 1) Static path — required for /smart_dehumidifier_files/...
    if not _registered_path:
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(URL_BASE, str(src), False)]
            )
            _registered_path = True
            _LOGGER.warning("SD static path OK: %s → %s", URL_BASE, src)
        except Exception as err:
            msg = str(err).lower()
            if "already" in msg or "exists" in msg:
                _registered_path = True
                _LOGGER.warning("SD static path already registered")
            else:
                _LOGGER.exception("SD static path FAILED: %s", err)
                return

    # Service: force re-register
    if not hass.services.has_service(DOMAIN, "register_card"):

        async def _handle_register(_call: ServiceCall) -> None:
            await _inject_module(hass)
            result = await _ensure_resource(hass)
            _LOGGER.warning("SD register_card → %s | URL=%s", result, CARD_URL_VERSIONED)
            if result not in ("ok", "updated", "created"):
                await _notify_manual(hass)

        hass.services.async_register(DOMAIN, "register_card", _handle_register)

    async def _boot(_now=None) -> None:
        await _inject_module(hass)
        result = await _ensure_resource(hass)
        _LOGGER.warning("SD boot register → %s | URL=%s", result, CARD_URL_VERSIONED)
        if result not in ("ok", "updated", "created"):
            await _notify_manual(hass)

    # Wait until frontend + lovelace exist (HA 2026 race)
    if hass.is_running:
        async_call_later(hass, 5, lambda now: hass.async_create_task(_boot()))
        async_call_later(hass, 20, lambda now: hass.async_create_task(_boot()))
    else:

        async def _on_start(_event: Event) -> None:
            async_call_later(hass, 5, lambda now: hass.async_create_task(_boot()))
            async_call_later(hass, 20, lambda now: hass.async_create_task(_boot()))

        hass.bus.async_listen_once("homeassistant_started", _on_start)


async def _inject_module(hass: HomeAssistant) -> bool:
    """Register extra module URL once frontend UrlManager exists."""
    try:
        from homeassistant.components.frontend import (
            DATA_EXTRA_MODULE_URL,
            add_extra_js_url,
        )
    except Exception as err:
        _LOGGER.warning("SD frontend import failed: %s", err)
        return False

    if DATA_EXTRA_MODULE_URL not in hass.data:
        _LOGGER.warning("SD frontend not ready yet (no DATA_EXTRA_MODULE_URL)")
        return False

    try:
        add_extra_js_url(hass, CARD_URL_VERSIONED)
        _LOGGER.warning("SD add_extra_js_url OK: %s", CARD_URL_VERSIONED)
        return True
    except Exception as err:
        _LOGGER.exception("SD add_extra_js_url FAILED: %s", err)
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
    """Create or update Lovelace resource entry."""
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
        _LOGGER.debug("SD resources load: %s", err)

    try:
        items = list(resources.async_items()) if hasattr(resources, "async_items") else []
    except Exception as err:
        _LOGGER.warning("SD async_items failed: %s", err)
        items = []

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

    target = CARD_URL_VERSIONED
    if found_url == target:
        return "ok"

    payload = {"res_type": "module", "url": target}

    if found_id is not None and hasattr(resources, "async_update_item"):
        try:
            await resources.async_update_item(found_id, payload)
            _LOGGER.warning("SD resource UPDATED → %s", target)
            return "updated"
        except Exception as err:
            _LOGGER.warning("SD resource update failed: %s", err)

    try:
        await resources.async_create_item(payload)
        _LOGGER.warning("SD resource CREATED → %s", target)
        return "created"
    except Exception as err:
        _LOGGER.warning("SD resource create failed: %s", err)
        return f"error:{err}"


async def _notify_manual(hass: HomeAssistant) -> None:
    """Show persistent notification with exact manual steps."""
    try:
        await hass.services.async_call(
            "persistent_notification",
            "create",
            {
                "notification_id": "smart_dehumidifier_card",
                "title": "Smart Dehumidifier — картка",
                "message": (
                    "Автоматична реєстрація ресурсу не вдалась.\n\n"
                    "Додай вручну:\n"
                    f"**Settings → Dashboards → Resources → Add**\n"
                    f"URL: `{CARD_URL_VERSIONED}`\n"
                    "Type: **JavaScript Module**\n\n"
                    "Потім Ctrl+F5.\n"
                    f"Перевірка файлу: `{CARD_URL_VERSIONED}` у браузері (має відкритись JS, не 404)."
                ),
            },
            blocking=False,
        )
    except Exception as err:
        _LOGGER.debug("SD notify failed: %s", err)
