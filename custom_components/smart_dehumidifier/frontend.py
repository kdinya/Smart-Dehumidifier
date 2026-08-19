"""Serve and register the Smart Dehumidifier Lovelace card.

Reliable delivery for HA 2024–2026:
1. HTTP View serves index.js with Content-Type: application/javascript
2. StaticPathConfig for the whole www/ directory
3. Copy to config/www → /local/smart_dehumidifier/index.js
4. add_extra_js_url (after frontend UrlManager is ready)
5. Lovelace resource create/update to current ?v=VERSION
"""

from __future__ import annotations

import logging
import shutil
from pathlib import Path

from aiohttp import web

from homeassistant.components.http import HomeAssistantView, StaticPathConfig
from homeassistant.core import Event, HomeAssistant, ServiceCall
from homeassistant.helpers.event import async_call_later

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

URL_BASE = f"/{DOMAIN}_files"
CARD_PATH = f"{URL_BASE}/index.js"
CARD_URL = f"{CARD_PATH}?v={VERSION}"

LOCAL_DIR = "smart_dehumidifier"
LOCAL_CARD = f"/local/{LOCAL_DIR}/index.js?v={VERSION}"

_path_done = False
_view_done = False


class SmartDehumidifierCardView(HomeAssistantView):
    """Serve the card JS with correct MIME type (no auth required for module load)."""

    url = CARD_PATH
    name = "smart_dehumidifier:card_js"
    requires_auth = False

    def __init__(self, file_path: Path) -> None:
        self._file_path = file_path

    async def get(self, request):  # noqa: ANN001
        if not self._file_path.is_file():
            return web.Response(status=404, text="card not found")
        return web.FileResponse(
            path=self._file_path,
            headers={
                "Content-Type": "application/javascript; charset=utf-8",
                "Cache-Control": "no-cache, must-revalidate",
                "Access-Control-Allow-Origin": "*",
            },
        )


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Install card files and register with frontend + Lovelace."""
    global _path_done, _view_done

    src = Path(__file__).resolve().parent / "www"
    index_js = src / "index.js"
    if not index_js.is_file():
        _LOGGER.error("SD card missing: %s", index_js)
        return

    # 1) Explicit HTTP view (correct Content-Type)
    if not _view_done:
        try:
            hass.http.register_view(SmartDehumidifierCardView(index_js))
            _view_done = True
            _LOGGER.warning("SD card HTTP view: %s", CARD_PATH)
        except Exception as err:
            _LOGGER.exception("SD HTTP view failed: %s", err)

    # 2) Static directory (fonts, extras)
    if not _path_done:
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(URL_BASE, str(src), False)]
            )
            _path_done = True
            _LOGGER.warning("SD static dir: %s → %s", URL_BASE, src)
        except Exception as err:
            msg = str(err).lower()
            if "already" in msg or "exists" in msg:
                _path_done = True
            else:
                _LOGGER.exception("SD static path failed: %s", err)

    # 3) Copy to /local/
    dest_dir = Path(hass.config.path("www", LOCAL_DIR))
    dest_js = dest_dir / "index.js"

    def _copy() -> None:
        dest_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(index_js, dest_js)

    try:
        await hass.async_add_executor_job(_copy)
        _LOGGER.warning("SD copied to %s", dest_js)
    except Exception as err:
        _LOGGER.warning("SD copy failed: %s", err)

    # Service
    if not hass.services.has_service(DOMAIN, "register_card"):

        async def _handle(_call: ServiceCall) -> None:
            try:
                await hass.async_add_executor_job(_copy)
            except Exception:
                pass
            await _inject_modules(hass)
            result = await _sync_lovelace_resource(hass)
            _LOGGER.warning("SD register_card → %s | %s", result, CARD_URL)

        hass.services.async_register(DOMAIN, "register_card", _handle)

    async def _boot(_now=None) -> None:
        await _inject_modules(hass)
        result = await _sync_lovelace_resource(hass)
        _LOGGER.warning("SD boot → %s | card=%s local=%s", result, CARD_URL, LOCAL_CARD)

    if hass.is_running:
        for delay in (2, 8, 20):
            async_call_later(hass, delay, lambda now, d=delay: hass.async_create_task(_boot()))
    else:

        async def _on_start(_event: Event) -> None:
            for delay in (3, 10, 25):
                async_call_later(
                    hass, delay, lambda now, d=delay: hass.async_create_task(_boot())
                )

        hass.bus.async_listen_once("homeassistant_started", _on_start)


async def _inject_modules(hass: HomeAssistant) -> None:
    try:
        from homeassistant.components.frontend import (
            DATA_EXTRA_MODULE_URL,
            add_extra_js_url,
        )
    except Exception as err:
        _LOGGER.warning("SD frontend import: %s", err)
        return

    if DATA_EXTRA_MODULE_URL not in hass.data:
        _LOGGER.warning("SD frontend UrlManager not ready")
        return

    for url in (CARD_URL, CARD_PATH, LOCAL_CARD):
        try:
            add_extra_js_url(hass, url)
        except Exception as err:
            _LOGGER.debug("SD inject %s: %s", url, err)
    _LOGGER.warning("SD modules injected: %s", CARD_URL)


def _resources(hass: HomeAssistant):
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


def _ours(url: str) -> bool:
    u = (url or "").lower()
    return "smart_dehumidifier" in u or "smart-dehumidifier" in u


async def _sync_lovelace_resource(hass: HomeAssistant) -> str:
    resources = _resources(hass)
    if resources is None:
        return "no_lovelace"
    if not hasattr(resources, "async_create_item"):
        _LOGGER.warning(
            "SD YAML resources — add manually: %s (JavaScript Module)", CARD_URL
        )
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
        return f"items_err:{err}"

    matches: list[tuple] = []
    for item in items:
        if isinstance(item, dict) and _ours(str(item.get("url") or "")):
            matches.append((item.get("id"), str(item.get("url") or "")))

    if any(u == CARD_URL for _, u in matches):
        for iid, u in matches:
            if u != CARD_URL and iid and hasattr(resources, "async_delete_item"):
                try:
                    await resources.async_delete_item(iid)
                    _LOGGER.warning("SD removed old resource %s", u)
                except Exception:
                    pass
        return "ok"

    payload = {"res_type": "module", "url": CARD_URL}

    if matches:
        iid, old = matches[0]
        if iid and hasattr(resources, "async_update_item"):
            try:
                await resources.async_update_item(iid, payload)
                _LOGGER.warning("SD resource UPDATED %s → %s", old, CARD_URL)
                for extra_id, extra_u in matches[1:]:
                    if extra_id and hasattr(resources, "async_delete_item"):
                        try:
                            await resources.async_delete_item(extra_id)
                        except Exception:
                            pass
                return "updated"
            except Exception as err:
                _LOGGER.warning("SD update failed: %s", err)

    try:
        await resources.async_create_item(payload)
        _LOGGER.warning("SD resource CREATED %s", CARD_URL)
        return "created"
    except Exception as err:
        _LOGGER.warning("SD create failed: %s", err)
        try:
            await hass.services.async_call(
                "persistent_notification",
                "create",
                {
                    "notification_id": "sd_card",
                    "title": "Smart Dehumidifier card",
                    "message": (
                        f"Add resource manually:\n"
                        f"URL: `{CARD_URL}`\n"
                        f"Type: JavaScript Module\n"
                        f"Then Ctrl+F5."
                    ),
                },
                blocking=False,
            )
        except Exception:
            pass
        return f"error:{err}"
