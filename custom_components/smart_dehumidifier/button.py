"""Button platform for manual toggle."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.entity import DeviceInfo

from .const import DOMAIN
from . import SmartDehumidifierCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: SmartDehumidifierCoordinator = hass.data[DOMAIN][entry.entry_id]
    entity = SmartDehumidifierManualButton(coordinator)
    async_add_entities([entity])
    coordinator.register_entity("manual_toggle", entity)


class SmartDehumidifierManualButton(ButtonEntity):
    """Button that toggles manual / pause mode."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:timer-outline"
    _attr_should_poll = False

    def __init__(self, coordinator: SmartDehumidifierCoordinator) -> None:
        self.coordinator = coordinator
        self._attr_unique_id = f"{coordinator.entry.entry_id}_manual_toggle"
        self._attr_name = "Manual Toggle"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.entry.entry_id)},
            name=coordinator.name,
            manufacturer="Smart Dehumidifier",
            model="Virtual Controller",
        )

    async def async_press(self) -> None:
        await self.coordinator.async_manual_toggle()
