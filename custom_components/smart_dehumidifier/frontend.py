"""Serve Lovelace card directly from the integration folder.

Source on disk (HACS installs here):
  /config/custom_components/smart_dehumidifier/www/

Browser URL (HTTP, not a file path):
  /smart_dehumidifier_files/index.js

No copy to /config/www required.
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.core import Event, HomeAssistant
from homeassistant.helpers.event import async_call_later

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

# HTTP path registered via StaticPathConfig → points at www/ inside the integration
URL_BASE = f"/{DOMAIN}_files"
CARD_URL = f"{URL_BASE}/index.js"
CARD_URL_VERSIONED = f"{CARD_URL}?v={VERSION}"

_registered = False


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register static HTTP path + Lovelace resource (idempotent)."""
    global _registered
    if _registered:
        return

    src = Path(__file__).resolve().parent / "www"
    if not src.is_dir():
        _LOGGER.error("Card folder missing: %s", src)
        return

    index = src / "index.js"
    if not index.is_file():
        _LOGGER.error("Card entry missing: %s", index)
        return

    # 1) Serve files over HTTP from the integration's www/ folder
    try:
        from homeassistant.components.http import StaticPathConfig

        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(src), False)]
        )
        _LOGGER.warning(
            "Smart Dehumidifier card URL: %s  (files from %s)",
            CARD_URL,
            src,
        )
        _registered = True
    except Exception as err:
        msg = str(err).lower()
        if "already" in msg or "exists" in msg:
            _registered = True
            _LOGGER.debug("Static path already registered: %s", URL_BASE)
        else:
            _LOGGER.exception("Failed to register static path %s: %s", URL_BASE, err)
            return

    # 2) Auto-add Lovelace resource (after HA is up)
    async def _add(_now=None) -> None:
        await _async_register_resource(hass)

    if hass.is_running:
        async_call_later(hass, 3, lambda now: hass.async_create_task(_add()))
    else:
        async def _on_start(_event: Event) -> None:
            async_call_later(hass, 3, lambda now: hass.async_create_task(_add()))

        hass.bus.async_listen_once("homeassistant_started", _on_start)


async def _async_register_resource(hass: HomeAssistant) -> None:
    resources = _find_resources(hass)
    if resources is None:
        _LOGGER.warning(
            "Add card resource manually → Settings → Dashboards → Resources: "
            "%s (JavaScript Module)",
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
        url = item.get("url", "") if isinstance(item, dict) else ""
        if DOMAIN in url or "smart_dehumidifier" in url:
            _LOGGER.info("Card resource already present: %s", url)
            return

    try:
        await resources.async_create_item(
            {"res_type": "module", "url": CARD_URL_VERSIONED}
        )
        _LOGGER.warning("Card resource auto-added: %s", CARD_URL_VERSIONED)
    except Exception as err:
        _LOGGER.warning(
            "Auto-add resource failed (%s). Add manually: %s (JavaScript Module)",
            err,
            CARD_URL,
        )


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
