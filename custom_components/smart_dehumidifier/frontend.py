"""Card registration — fix for existing /smart_dehumidifier_files resource.

User still has resource: /smart_dehumidifier_files/index.js?v=1.5.2
In 1.9.0 static path was removed → that URL 404 → card broken.

1.9.1 restores static path so the EXISTING resource works again
(query ?v=1.5.2 is ignored; file served is current self-contained index.js).
Also copies to /local and tries to update the resource URL.
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

# Old path (user's existing resource from v1.5.2)
URL_BASE = f"/{DOMAIN}_files"
FILES_CARD = f"{URL_BASE}/index.js"
FILES_CARD_VERSIONED = f"{FILES_CARD}?v={VERSION}"

# New path via /local
LOCAL_DIR = "smart_dehumidifier"
LOCAL_CARD = f"/local/{LOCAL_DIR}/index.js"
LOCAL_CARD_VERSIONED = f"{LOCAL_CARD}?v={VERSION}"

# Prefer updating resource to this
PREFERRED_URL = LOCAL_CARD_VERSIONED

_registered_path = False


async def async_register_frontend(hass: HomeAssistant) -> None:
    global _registered_path

    src = Path(__file__).resolve().parent / "www"
    index_js = src / "index.js"
    if not index_js.is_file():
        _LOGGER.error("SD card missing: %s", index_js)
        return

    # 1) Restore static path — CRITICAL for existing ?v=1.5.2 resource
    if not _registered_path:
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(URL_BASE, str(src), False)]
            )
            _registered_path = True
            _LOGGER.warning("SD static path restored: %s → %s", URL_BASE, src)
        except Exception as err:
            if "already" in str(err).lower() or "exists" in str(err).lower():
                _registered_path = True
                _LOGGER.warning("SD static path already registered")
            else:
                _LOGGER.exception("SD static path failed: %s", err)

    # 2) Copy to config/www for /local/...
    dest_dir = Path(hass.config.path("www", LOCAL_DIR))
    dest_index = dest_dir / "index.js"

    def _copy() -> None:
        dest_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(index_js, dest_index)

    try:
        await hass.async_add_executor_job(_copy)
        _LOGGER.warning("SD card copied to %s", dest_index)
    except Exception as err:
        _LOGGER.exception("SD copy to www failed: %s", err)

    if not hass.services.has_service(DOMAIN, "register_card"):

        async def _handle(_call: ServiceCall) -> None:
            try:
                await hass.async_add_executor_job(_copy)
            except Exception:
                pass
            await _inject(hass)
            result = await _ensure_resource(hass)
            _LOGGER.warning("SD register_card → %s", result)

        hass.services.async_register(DOMAIN, "register_card", _handle)

    async def _boot(_now=None) -> None:
        await _inject(hass)
        result = await _ensure_resource(hass)
        _LOGGER.warning(
            "SD boot → %s | static=%s local=%s",
            result,
            FILES_CARD_VERSIONED,
            LOCAL_CARD_VERSIONED,
        )

    if hass.is_running:
        async_call_later(hass, 2, lambda now: hass.async_create_task(_boot()))
        async_call_later(hass, 12, lambda now: hass.async_create_task(_boot()))
    else:

        async def _on_start(_event: Event) -> None:
            async_call_later(hass, 3, lambda now: hass.async_create_task(_boot()))
            async_call_later(hass, 12, lambda now: hass.async_create_task(_boot()))

        hass.bus.async_listen_once("homeassistant_started", _on_start)


async def _inject(hass: HomeAssistant) -> None:
    """Inject BOTH urls so old resource path and new path both load the card."""
    try:
        from homeassistant.components.frontend import (
            DATA_EXTRA_MODULE_URL,
            add_extra_js_url,
        )
    except Exception as err:
        _LOGGER.warning("SD frontend import: %s", err)
        return

    if DATA_EXTRA_MODULE_URL not in hass.data:
        _LOGGER.warning("SD frontend not ready")
        return

    for url in (FILES_CARD_VERSIONED, LOCAL_CARD_VERSIONED, FILES_CARD, LOCAL_CARD):
        try:
            add_extra_js_url(hass, url)
        except Exception as err:
            _LOGGER.debug("SD inject %s: %s", url, err)
    _LOGGER.warning("SD modules injected (files + local)")


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
    """Update existing /smart_dehumidifier_files... resource to preferred URL."""
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

    found_id = None
    found_url = None
    for item in items:
        if not isinstance(item, dict):
            continue
        url = str(item.get("url") or "")
        if "dehumidifier" in url.lower() or "smart_dehumidifier" in url:
            found_id = item.get("id")
            found_url = url
            break

    # Already preferred
    if found_url == PREFERRED_URL:
        return "ok"

    payload = {"res_type": "module", "url": PREFERRED_URL}

    # Update the old 1.5.2 resource in place
    if found_id is not None and hasattr(resources, "async_update_item"):
        try:
            await resources.async_update_item(found_id, payload)
            _LOGGER.warning("SD resource UPDATED: %s → %s", found_url, PREFERRED_URL)
            return "updated"
        except Exception as err:
            _LOGGER.warning("SD update failed (%s), will try create", err)

    # Create preferred if missing
    if found_url is None or found_url != PREFERRED_URL:
        try:
            await resources.async_create_item(payload)
            _LOGGER.warning("SD resource CREATED: %s", PREFERRED_URL)
            return "created"
        except Exception as err:
            _LOGGER.warning("SD create failed: %s", err)
            # Last resort: at least make sure old path resource has current version query
            if found_id is not None and hasattr(resources, "async_update_item"):
                try:
                    await resources.async_update_item(
                        found_id,
                        {"res_type": "module", "url": FILES_CARD_VERSIONED},
                    )
                    _LOGGER.warning(
                        "SD resource bumped to %s", FILES_CARD_VERSIONED
                    )
                    return "bumped_old"
                except Exception as err2:
                    _LOGGER.warning("SD bump old failed: %s", err2)
            return f"error:{err}"

    return "ok"
