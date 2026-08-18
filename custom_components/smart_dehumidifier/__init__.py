"""Smart Dehumidifier integration."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, VERSION
from .coordinator import SmartDehumidifierCoordinator
from .frontend import async_register_frontend

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.SWITCH,
    Platform.NUMBER,
    Platform.BUTTON,
]

SERVICE_MANUAL_TOGGLE = "manual_toggle"
SERVICE_MANUAL_TOGGLE_SCHEMA = vol.Schema(
    {
        vol.Optional("entry_id"): cv.string,
    }
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Smart Dehumidifier component (YAML not used)."""
    hass.data.setdefault(DOMAIN, {})
    await async_register_frontend(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Smart Dehumidifier from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Ensure card is served even if async_setup was skipped
    await async_register_frontend(hass)

    coordinator = SmartDehumidifierCoordinator(hass, entry)
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await coordinator.async_setup()

    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    # Register domain service once
    if not hass.services.has_service(DOMAIN, SERVICE_MANUAL_TOGGLE):
        async def handle_manual_toggle(call: ServiceCall) -> None:
            target_id = call.data.get("entry_id")
            if target_id:
                coord = hass.data[DOMAIN].get(target_id)
                if coord:
                    await coord.async_manual_toggle()
                else:
                    _LOGGER.warning("No coordinator for entry_id=%s", target_id)
                return

            # No entry_id → toggle all (or first) instances
            for coord in hass.data[DOMAIN].values():
                if isinstance(coord, SmartDehumidifierCoordinator):
                    await coord.async_manual_toggle()

        hass.services.async_register(
            DOMAIN,
            SERVICE_MANUAL_TOGGLE,
            handle_manual_toggle,
            schema=SERVICE_MANUAL_TOGGLE_SCHEMA,
        )

    _LOGGER.info("Smart Dehumidifier %s loaded for %s", VERSION, entry.title)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        coordinator: SmartDehumidifierCoordinator | None = hass.data[DOMAIN].pop(
            entry.entry_id, None
        )
        if coordinator:
            await coordinator.async_unload()
    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)
