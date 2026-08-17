"""Register Lovelace card frontend resources."""

from __future__ import annotations

import logging
import shutil
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_call_later

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

URL_BASE = f"/{DOMAIN}_static"
CARD_URL = f"{URL_BASE}/index.js"
CARD_URL_VERSIONED = f"{CARD_URL}?v={VERSION}"

# Fallback under /local/ (config/www)
LOCAL_DIR_NAME = "smart_dehumidifier"
LOCAL_CARD_URL = f"/local/{LOCAL_DIR_NAME}/index.js"
LOCAL_CARD_URL_VERSIONED = f"{LOCAL_CARD_URL}?v={VERSION}"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register static path + auto-add Lovelace resource."""
    www = Path(__file__).parent / "www"
    if not www.is_dir():
        _LOGGER.error("www folder missing at %s", www)
        return

    # 1) Static path from custom_components
    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(www), False)]
        )
        _LOGGER.info("Static path registered: %s", URL_BASE)
    except Exception as err:
        _LOGGER.debug("Static path: %s", err)

    # 2) Fallback copy to config/www (always works as /local/...)
    await hass.async_add_executor_job(_copy_to_local_www, hass, www)

    # 3) Register resource after HA fully started (lovelace may not be ready yet)
    if hass.is_running:
        async_call_later(hass, 3, lambda _now: hass.async_create_task(_async_add_resource(hass)))
    else:
        hass.bus.async_listen_once(
            "homeassistant_started",
            lambda _event: hass.async_create_task(_async_add_resource(hass)),
        )


def _copy_to_local_www(hass: HomeAssistant, www: Path) -> None:
    """Copy card files into config/www/smart_dehumidifier for /local/ access."""
    try:
        dest = Path(hass.config.path("www")) / LOCAL_DIR_NAME
        dest.mkdir(parents=True, exist_ok=True)
        # Copy tree
        for src in www.rglob("*"):
            if src.is_file():
                rel = src.relative_to(www)
                target = dest / rel
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, target)
        _LOGGER.info("Card copied to /local/%s/ (fallback)", LOCAL_DIR_NAME)
    except Exception as err:
        _LOGGER.warning("Could not copy card to www: %s", err)


async def _async_add_resource(hass: HomeAssistant) -> None:
    """Add Lovelace resource if missing (storage mode only)."""
    # Prefer /local/ fallback URL — most reliable after copy
    urls_to_try = [LOCAL_CARD_URL_VERSIONED, CARD_URL_VERSIONED]

    resources = await _get_resources(hass)
    if resources is None:
        _LOGGER.warning(
            "Lovelace resources unavailable (YAML mode?). "
            "Add manually: %s type module",
            LOCAL_CARD_URL,
        )
        return

    try:
        if hasattr(resources, "async_load"):
            await resources.async_load()
    except Exception:
        pass

    existing_urls = []
    try:
        items = resources.async_items() if hasattr(resources, "async_items") else []
        existing_urls = [i.get("url", "") for i in items]
    except Exception as err:
        _LOGGER.debug("List resources: %s", err)

    # Already registered?
    for u in existing_urls:
        if "smart_dehumidifier" in u:
            _LOGGER.info("Card resource already present: %s", u)
            return

    # Create
    for url in urls_to_try:
        try:
            await resources.async_create_item({"res_type": "module", "url": url})
            _LOGGER.info("Lovelace resource auto-added: %s", url)
            return
        except Exception as err:
            _LOGGER.debug("Create resource %s failed: %s", url, err)

    _LOGGER.warning(
        "Could not auto-add resource. Add manually in "
        "Settings → Dashboards → Resources: %s (JavaScript Module)",
        LOCAL_CARD_URL,
    )


async def _get_resources(hass: HomeAssistant):
    """Get Lovelace ResourceStorageCollection if available."""
    # Modern HA: hass.data["lovelace"] can be a dict of dashboards or LovelaceData
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None

    # Direct attribute
    resources = getattr(lovelace, "resources", None)
    if resources is not None:
        return resources

    # Dict structure (multi-dashboard)
    if isinstance(lovelace, dict):
        # Prefer default dashboard resources
        for key in ("resources", "dashboards"):
            if key in lovelace:
                obj = lovelace[key]
                res = getattr(obj, "resources", obj if hasattr(obj, "async_create_item") else None)
                if res is not None and hasattr(res, "async_create_item"):
                    return res
        # Search values
        for val in lovelace.values():
            res = getattr(val, "resources", None)
            if res is not None and hasattr(res, "async_create_item"):
                return res

    return None
