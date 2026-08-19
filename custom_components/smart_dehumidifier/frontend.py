"""Register static files + Lovelace resource for the card.

Resource URL (exactly what appears in Settings → Dashboards → Resources):
  /smart_dehumidifier_files/index.js?v=<VERSION>
  type: module
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
# User-facing resource path (must match what appears in Resources panel)
CARD_RESOURCE_URL = f"{URL_BASE}/index.js?v={VERSION}"

_registered_path = False
_extra_js_added = False


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Serve www/ and ensure Lovelace resource exists."""
    global _registered_path, _extra_js_added

    src = Path(__file__).resolve().parent / "www"
    index_js = src / "index.js"
    bundle_js = src / "smart-dehumidifier.js"
    if not index_js.is_file() or not bundle_js.is_file():
        _LOGGER.error(
            "SD card files missing (need index.js + smart-dehumidifier.js) in %s", src
        )
        return

    # 1) Static HTTP path
    if not _registered_path:
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(URL_BASE, str(src), False)]
            )
            _registered_path = True
            _LOGGER.info("SD static path: %s → %s", URL_BASE, src)
        except Exception as err:  # noqa: BLE001
            if "already" in str(err).lower() or "exists" in str(err).lower():
                _registered_path = True
            else:
                _LOGGER.exception("SD static path failed: %s", err)
                return

    # 2) Inject module into frontend (works even if Resources UI fails)
    if not _extra_js_added:
        try:
            add_extra_js_url(hass, CARD_RESOURCE_URL)
            _extra_js_added = True
            _LOGGER.info("SD add_extra_js_url: %s", CARD_RESOURCE_URL)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("SD add_extra_js_url failed: %s", err)

    # 3) Persist into Lovelace Resources (storage mode)
    async def _chain() -> None:
        delays = (0.5, 2, 5, 10, 20, 40, 60)
        for delay in delays:
            await asyncio.sleep(delay)
            result = await _async_ensure_lovelace_resource(hass)
            if result == "ok":
                return
            if result == "yaml":
                _LOGGER.error(
                    "SD: Lovelace resources are in YAML mode — cannot auto-create. "
                    "Add manually to configuration.yaml / ui-lovelace.yaml:\n"
                    "  resources:\n"
                    "    - url: %s\n"
                    "      type: module",
                    CARD_RESOURCE_URL,
                )
                return
        _LOGGER.error(
            "SD: failed to create Lovelace resource after retries. "
            "Add manually in Settings → Dashboards → Resources:\n"
            "  URL: %s\n"
            "  Type: JavaScript Module",
            CARD_RESOURCE_URL,
        )

    if hass.is_running:
        hass.async_create_task(_chain(), name="sd_lovelace_resource")
    else:

        async def _on_start(_event: Event) -> None:
            hass.async_create_task(_chain(), name="sd_lovelace_resource_start")

        hass.bus.async_listen_once("homeassistant_started", _on_start)


def _get_resource_collection(hass: HomeAssistant):
    """Return Lovelace resource collection or None."""
    # Prefer LOVELACE_DATA HassKey (HA 2025+)
    try:
        from homeassistant.components.lovelace.const import LOVELACE_DATA

        data = hass.data.get(LOVELACE_DATA)
        if data is not None:
            return getattr(data, "resources", None)
    except Exception:  # noqa: BLE001
        pass

    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None

    # LovelaceData object
    if hasattr(lovelace, "resources"):
        return lovelace.resources

    # Legacy dict
    if isinstance(lovelace, dict):
        return lovelace.get("resources")

    try:
        return lovelace["resources"]  # type: ignore[index]
    except Exception:  # noqa: BLE001
        return None


async def _async_ensure_lovelace_resource(hass: HomeAssistant) -> str:
    """Create/update resource. Returns 'ok' | 'yaml' | 'retry'."""
    resources = _get_resource_collection(hass)
    if resources is None:
        _LOGGER.debug("SD: lovelace resources not available yet")
        return "retry"

    # YAML collection has no create
    if not hasattr(resources, "async_create_item"):
        return "yaml"

    # Force load from disk (HA 2025+)
    try:
        if hasattr(resources, "async_load"):
            loaded = getattr(resources, "loaded", False)
            if not loaded:
                await resources.async_load()
                if hasattr(resources, "loaded"):
                    resources.loaded = True
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("SD resources.async_load: %s", err)

    try:
        items = list(resources.async_items()) if hasattr(resources, "async_items") else []
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("SD async_items: %s", err)
        return "retry"

    found_id = None
    found_url = None
    for item in items:
        if not isinstance(item, dict):
            continue
        url = str(item.get("url") or "")
        # Match any previous SD resource URLs
        if (
            URL_BASE in url
            or "smart_dehumidifier" in url
            or "smart-dehumidifier" in url
        ):
            found_id = item.get("id")
            found_url = url
            break

    if found_url == CARD_RESOURCE_URL:
        _LOGGER.info("SD Lovelace resource already present: %s", CARD_RESOURCE_URL)
        return "ok"

    payload = {"res_type": "module", "url": CARD_RESOURCE_URL}

    if found_id is not None:
        try:
            await resources.async_update_item(found_id, payload)
            _LOGGER.info(
                "SD Lovelace resource UPDATED: %s → %s", found_url, CARD_RESOURCE_URL
            )
            return "ok"
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("SD resource update failed: %s", err)

    try:
        await resources.async_create_item(payload)
        _LOGGER.info("SD Lovelace resource CREATED: %s", CARD_RESOURCE_URL)
        return "ok"
    except Exception as err:  # noqa: BLE001
        _LOGGER.warning("SD resource create failed: %s", err)
        return "retry"
