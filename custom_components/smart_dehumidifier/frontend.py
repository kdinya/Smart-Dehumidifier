"""Register card and FORCE-UPDATE Lovelace resource on every version bump.

On update, existing resource (e.g. ...?v=1.5.2) is rewritten to current VERSION URL.
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
# Canonical resource URL — always current version
CARD_URL = f"{URL_BASE}/index.js?v={VERSION}"

LOCAL_DIR = "smart_dehumidifier"
LOCAL_CARD_URL = f"/local/{LOCAL_DIR}/index.js?v={VERSION}"

_registered_path = False


async def async_register_frontend(hass: HomeAssistant) -> None:
    global _registered_path

    src = Path(__file__).resolve().parent / "www"
    index_js = src / "index.js"
    if not index_js.is_file():
        _LOGGER.error("SD card missing: %s", index_js)
        return

    # Static path so /smart_dehumidifier_files/index.js is served
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

    # Also copy to /local for backup path
    dest_dir = Path(hass.config.path("www", LOCAL_DIR))
    dest_index = dest_dir / "index.js"

    def _copy() -> None:
        dest_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(index_js, dest_index)

    try:
        await hass.async_add_executor_job(_copy)
    except Exception as err:
        _LOGGER.warning("SD copy to www: %s", err)

    if not hass.services.has_service(DOMAIN, "register_card"):

        async def _handle(_call: ServiceCall) -> None:
            try:
                await hass.async_add_executor_job(_copy)
            except Exception:
                pass
            await _inject(hass)
            result = await _sync_resource(hass)
            _LOGGER.warning("SD register_card → %s | %s", result, CARD_URL)

        hass.services.async_register(DOMAIN, "register_card", _handle)

    async def _boot(_now=None) -> None:
        await _inject(hass)
        result = await _sync_resource(hass)
        _LOGGER.warning("SD resource sync → %s | %s", result, CARD_URL)

    if hass.is_running:
        async_call_later(hass, 2, lambda now: hass.async_create_task(_boot()))
        async_call_later(hass, 10, lambda now: hass.async_create_task(_boot()))
        async_call_later(hass, 25, lambda now: hass.async_create_task(_boot()))
    else:

        async def _on_start(_event: Event) -> None:
            async_call_later(hass, 3, lambda now: hass.async_create_task(_boot()))
            async_call_later(hass, 12, lambda now: hass.async_create_task(_boot()))

        hass.bus.async_listen_once("homeassistant_started", _on_start)


async def _inject(hass: HomeAssistant) -> None:
    try:
        from homeassistant.components.frontend import (
            DATA_EXTRA_MODULE_URL,
            add_extra_js_url,
        )
    except Exception:
        return
    if DATA_EXTRA_MODULE_URL not in hass.data:
        return
    for url in (CARD_URL, LOCAL_CARD_URL, f"{URL_BASE}/index.js"):
        try:
            add_extra_js_url(hass, url)
        except Exception:
            pass
    _LOGGER.warning("SD module injected: %s", CARD_URL)


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


def _is_our_resource(url: str) -> bool:
    u = url.lower()
    return (
        "smart_dehumidifier" in u
        or "smart-dehumidifier" in u
        or "dehumidifier" in u and ("hacsfiles" in u or "/local/" in u or "_files" in u)
    )


async def _sync_resource(hass: HomeAssistant) -> str:
    """Force resource URL to current CARD_URL (replaces ?v=1.5.2 etc.)."""
    resources = _get_resources(hass)
    if resources is None:
        return "no_lovelace"
    if not hasattr(resources, "async_create_item"):
        _LOGGER.warning(
            "SD YAML mode: set resource manually to %s (JavaScript Module)", CARD_URL
        )
        return "yaml_mode"

    try:
        if hasattr(resources, "async_load") and not getattr(resources, "loaded", False):
            await resources.async_load()
            if hasattr(resources, "loaded"):
                resources.loaded = True
    except Exception as err:
        _LOGGER.debug("SD load resources: %s", err)

    try:
        items = list(resources.async_items()) if hasattr(resources, "async_items") else []
    except Exception as err:
        _LOGGER.warning("SD async_items failed: %s", err)
        return f"items_error:{err}"

    our_items: list[tuple[str | None, str]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        url = str(item.get("url") or "")
        if _is_our_resource(url):
            our_items.append((item.get("id"), url))

    # Already correct
    if any(url == CARD_URL for _, url in our_items):
        # Remove duplicate old entries if any
        for item_id, url in our_items:
            if url != CARD_URL and item_id and hasattr(resources, "async_delete_item"):
                try:
                    await resources.async_delete_item(item_id)
                    _LOGGER.warning("SD deleted old resource: %s", url)
                except Exception as err:
                    _LOGGER.debug("SD delete old: %s", err)
        return "ok"

    payload = {"res_type": "module", "url": CARD_URL}

    # Update first matching old entry (e.g. ?v=1.5.2 → ?v=1.9.2)
    if our_items:
        item_id, old_url = our_items[0]
        if item_id and hasattr(resources, "async_update_item"):
            try:
                await resources.async_update_item(item_id, payload)
                _LOGGER.warning("SD resource UPDATED: %s → %s", old_url, CARD_URL)
                # Delete extra duplicates
                for extra_id, extra_url in our_items[1:]:
                    if extra_id and hasattr(resources, "async_delete_item"):
                        try:
                            await resources.async_delete_item(extra_id)
                            _LOGGER.warning("SD deleted duplicate: %s", extra_url)
                        except Exception:
                            pass
                return "updated"
            except Exception as err:
                _LOGGER.warning("SD update failed: %s", err)

    # No existing entry — create
    try:
        await resources.async_create_item(payload)
        _LOGGER.warning("SD resource CREATED: %s", CARD_URL)
        return "created"
    except Exception as err:
        _LOGGER.warning("SD create failed: %s — add manually: %s", err, CARD_URL)
        try:
            await hass.services.async_call(
                "persistent_notification",
                "create",
                {
                    "notification_id": "smart_dehumidifier_card",
                    "title": "Smart Dehumidifier — ресурс картки",
                    "message": (
                        f"Оновіть або додайте в Resources:\n"
                        f"`{CARD_URL}`\n"
                        f"Type: JavaScript Module\n"
                        f"Потім Ctrl+F5."
                    ),
                },
                blocking=False,
            )
        except Exception:
            pass
        return f"error:{err}"
