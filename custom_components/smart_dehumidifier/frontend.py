"""Serve and auto-register the Lovelace card.

Standard layout:
  custom_components/smart_dehumidifier/www/   ← source (in the integration)
  /config/www/smart_dehumidifier/             ← copied on startup
  URL: /local/smart_dehumidifier/index.js     ← what the browser loads
"""

from __future__ import annotations

import logging
import shutil
from pathlib import Path

from homeassistant.core import Event, HomeAssistant
from homeassistant.helpers.event import async_call_later

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

# Browser URL (never a filesystem path!)
LOCAL_DIR = "smart_dehumidifier"
CARD_URL = f"/local/{LOCAL_DIR}/index.js"
CARD_URL_VERSIONED = f"{CARD_URL}?v={VERSION}"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Copy card to /config/www and register Lovelace resource."""
    src = Path(__file__).parent / "www"
    if not src.is_dir():
        _LOGGER.error("Card source missing: %s", src)
        return

    # Copy into HA's www folder → available as /local/smart_dehumidifier/
    await hass.async_add_executor_job(_sync_www, hass, src)

    # Register resource after startup (Lovelace may not be ready yet)
    async def _later(_now=None) -> None:
        await _async_register_resource(hass)

    if hass.is_running:
        async_call_later(hass, 5, lambda now: hass.async_create_task(_later()))
    else:
        async def _on_start(_event: Event) -> None:
            async_call_later(hass, 5, lambda now: hass.async_create_task(_later()))

        hass.bus.async_listen_once("homeassistant_started", _on_start)


def _sync_www(hass: HomeAssistant, src: Path) -> None:
    """Mirror www/ → config/www/smart_dehumidifier/."""
    dest = Path(hass.config.path("www")) / LOCAL_DIR
    try:
        dest.mkdir(parents=True, exist_ok=True)
        # Remove stale files, then copy fresh
        if dest.exists():
            for old in dest.rglob("*"):
                if old.is_file():
                    # keep copying over
                    pass
        for item in src.rglob("*"):
            if not item.is_file():
                continue
            rel = item.relative_to(src)
            target = dest / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target)
        _LOGGER.info(
            "Smart Dehumidifier card ready at %s (from %s)",
            CARD_URL,
            src,
        )
    except Exception as err:
        _LOGGER.exception("Failed to copy card to www: %s", err)


async def _async_register_resource(hass: HomeAssistant) -> None:
    """Add /local/smart_dehumidifier/index.js to Lovelace resources if missing."""
    resources = _find_resources(hass)
    if resources is None:
        _LOGGER.warning(
            "Lovelace resources not available. Add manually: %s (type: module)",
            CARD_URL,
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

    for item in items:
        url = (item.get("url") or "") if isinstance(item, dict) else ""
        if "smart_dehumidifier" in url:
            _LOGGER.info("Card resource already registered: %s", url)
            return

    try:
        await resources.async_create_item(
            {"res_type": "module", "url": CARD_URL_VERSIONED}
        )
        _LOGGER.info("Card resource registered: %s", CARD_URL_VERSIONED)
    except Exception as err:
        _LOGGER.warning(
            "Could not auto-add resource (%s). Add manually: %s (JavaScript Module)",
            err,
            CARD_URL,
        )


def _find_resources(hass: HomeAssistant):
    """Locate ResourceStorageCollection across HA versions."""
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
