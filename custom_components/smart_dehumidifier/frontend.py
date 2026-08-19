"""Serve Lovelace card + auto-register/update resource with ?v=VERSION.

Uses both:
- add_extra_js_url (reliable load of custom element without manual resource)
- Lovelace resource create/update (for storage-mode dashboards)
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
CARD_URL = f"{URL_BASE}/index.js"
CARD_URL_VERSIONED = f"{CARD_URL}?v={VERSION}"

_registered_path = False


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register static path, inject JS, and ensure Lovelace resource has current ?v=."""
    global _registered_path

    src = Path(__file__).resolve().parent / "www"
    if not src.is_dir() or not (src / "index.js").is_file():
        _LOGGER.error("Card www/ missing at %s", src)
        return

    if not _registered_path:
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(URL_BASE, str(src), False)]
            )
            _registered_path = True
            _LOGGER.debug("SD card static path %s → %s", URL_BASE, src)
        except Exception as err:
            if "already" in str(err).lower() or "exists" in str(err).lower():
                _registered_path = True
            else:
                _LOGGER.exception("Static path failed: %s", err)
                return

    # Critical: inject module so custom element registers even without Lovelace resource
    try:
        add_extra_js_url(hass, CARD_URL_VERSIONED)
        _LOGGER.debug("SD card extra JS: %s", CARD_URL_VERSIONED)
    except Exception as err:
        _LOGGER.warning("add_extra_js_url failed: %s", err)

    async def _ensure_lovelace_resource(delay: float) -> None:
        await asyncio.sleep(delay)
        await _async_ensure_resource(hass)

    if hass.is_running:
        hass.async_create_task(
            _ensure_lovelace_resource(2), name="smart_dehumidifier_resource_ensure"
        )
        hass.async_create_task(
            _ensure_lovelace_resource(15), name="smart_dehumidifier_resource_retry"
        )
    else:

        async def _on_start(_event: Event) -> None:
            hass.async_create_task(
                _ensure_lovelace_resource(2),
                name="smart_dehumidifier_resource_start",
            )

        hass.bus.async_listen_once("homeassistant_started", _on_start)


async def _async_ensure_resource(hass: HomeAssistant) -> None:
    """Create or UPDATE Lovelace resource to CARD_URL_VERSIONED."""
    resources = _find_resources(hass)
    if resources is None:
        _LOGGER.info(
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
        if (
            "/smart_dehumidifier_files/" not in url
            and "smart_dehumidifier" not in url
            and "dehumidifier" not in url.lower()
        ):
            continue
        found_id = item.get("id")
        found_url = url
        break

    if found_url == target:
        _LOGGER.debug("SD card resource OK: %s", target)
        return

    if found_id is not None and hasattr(resources, "async_update_item"):
        try:
            await resources.async_update_item(
                found_id, {"res_type": "module", "url": target}
            )
            _LOGGER.info("SD card resource UPDATED: %s → %s", found_url, target)
            return
        except Exception as err:
            _LOGGER.debug("Resource update failed (%s), try create", err)

    if found_url is None:
        try:
            await resources.async_create_item({"res_type": "module", "url": target})
            _LOGGER.info("SD card resource CREATED: %s", target)
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
            _LOGGER.info("SD card resource added (old left): %s", target)
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
