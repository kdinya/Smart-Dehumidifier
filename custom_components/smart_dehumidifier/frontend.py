"""Serve Lovelace card and register it reliably on HA 2024–2026.

Strategy (in order):
1. Static path /smart_dehumidifier_files → www/
2. add_extra_js_url (loads module into frontend without manual resource)
3. Lovelace storage resource create/update (after async_load, HA 2025.2+ safe)
"""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import Event, HomeAssistant

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

URL_BASE = f"/{DOMAIN}_files"
CARD_PATH = f"{URL_BASE}/smart-dehumidifier.js"
CARD_URL_VERSIONED = f"{CARD_PATH}?v={VERSION}"

_registered_path = False
_extra_js_added = False


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register static files, inject JS, schedule Lovelace resource ensure."""
    global _registered_path, _extra_js_added

    src = Path(__file__).resolve().parent / "www"
    card_file = src / "index.js"
    if not card_file.is_file():
        _LOGGER.error("Smart Dehumidifier card missing: %s", card_file)
        return

    if not _registered_path:
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(URL_BASE, str(src), False)]
            )
            _registered_path = True
            _LOGGER.info("SD static path registered: %s → %s", URL_BASE, src)
        except Exception as err:  # noqa: BLE001
            msg = str(err).lower()
            if "already" in msg or "exists" in msg:
                _registered_path = True
            else:
                _LOGGER.exception("SD static path failed: %s", err)
                return

    if not _extra_js_added:
        try:
            add_extra_js_url(hass, CARD_URL_VERSIONED)
            _extra_js_added = True
            _LOGGER.info("SD card injected via add_extra_js_url: %s", CARD_URL_VERSIONED)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("SD add_extra_js_url failed: %s", err)

    async def _retry_chain() -> None:
        for delay in (1, 3, 8, 20, 45):
            await asyncio.sleep(delay)
            ok = await _async_ensure_resource(hass)
            if ok:
                return

    if hass.is_running:
        hass.async_create_task(_retry_chain(), name="smart_dehumidifier_resource_chain")
    else:

        async def _on_start(_event: Event) -> None:
            hass.async_create_task(
                _retry_chain(), name="smart_dehumidifier_resource_chain_start"
            )

        hass.bus.async_listen_once("homeassistant_started", _on_start)


def _get_resources(hass: HomeAssistant):
    """Return Lovelace ResourceStorageCollection (HA 2024 / 2025.2+)."""
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None

    # HA 2025.2+: lovelace.resources (object attribute)
    resources = getattr(lovelace, "resources", None)
    if resources is not None:
        return resources

    # Older: dict-style access
    if isinstance(lovelace, dict):
        return lovelace.get("resources")

    try:
        return lovelace["resources"]  # type: ignore[index]
    except Exception:  # noqa: BLE001
        return None


async def _async_ensure_resource(hass: HomeAssistant) -> bool:
    """Create or update Lovelace module resource. Returns True if present."""
    resources = _get_resources(hass)
    if resources is None:
        _LOGGER.debug(
            "SD: lovelace resources not ready yet. "
            "Add manually if needed: %s (JavaScript Module)",
            CARD_URL_VERSIONED,
        )
        return False

    # CRITICAL on HA 2025+: load from disk before items/create
    try:
        if hasattr(resources, "async_load") and not getattr(resources, "loaded", False):
            await resources.async_load()
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("SD resources.async_load: %s", err)
        try:
            if hasattr(resources, "async_load"):
                await resources.async_load()
        except Exception:  # noqa: BLE001
            pass

    try:
        items = list(resources.async_items()) if hasattr(resources, "async_items") else []
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("SD async_items failed: %s", err)
        return False

    found_id = None
    found_url = None
    for item in items:
        if not isinstance(item, dict):
            continue
        url = str(item.get("url") or "")
        if URL_BASE in url or "smart_dehumidifier" in url:
            found_id = item.get("id")
            found_url = url
            break

    if found_url == CARD_URL_VERSIONED:
        _LOGGER.info("SD Lovelace resource OK: %s", CARD_URL_VERSIONED)
        return True

    payload = {"res_type": "module", "url": CARD_URL_VERSIONED}

    if found_id is not None and hasattr(resources, "async_update_item"):
        try:
            await resources.async_update_item(found_id, payload)
            _LOGGER.info("SD Lovelace resource UPDATED: %s → %s", found_url, CARD_URL_VERSIONED)
            return True
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("SD resource update failed: %s", err)

    if found_url is None and hasattr(resources, "async_create_item"):
        try:
            await resources.async_create_item(payload)
            _LOGGER.info("SD Lovelace resource CREATED: %s", CARD_URL_VERSIONED)
            return True
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning(
                "SD resource create failed (%s). Add manually: %s (module)",
                err,
                CARD_URL_VERSIONED,
            )
            return False

    if found_url and found_url != CARD_URL_VERSIONED:
        try:
            await resources.async_create_item(payload)
            _LOGGER.info("SD Lovelace resource added (old kept): %s", CARD_URL_VERSIONED)
            return True
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("SD could not add resource: %s", err)

    return False
