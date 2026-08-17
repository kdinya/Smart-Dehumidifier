"""Switch platform for Smart Dehumidifier (Auto mode)."""

from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.entity import DeviceInfo

from .const import DOMAIN, KEY_AUTO
from . import SmartDehumidifierCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: SmartDehumidifierCoordinator = hass.data[DOMAIN][entry.entry_id]
    entity = SmartDehumidifierAutoSwitch(coordinator)
    async_add_entities([entity])
    coordinator.register_entity(KEY_AUTO, entity)


class SmartDehumidifierAutoSwitch(SwitchEntity):
    """Auto humidity mode switch."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:water-percent"
    _attr_should_poll = False

    def __init__(self, coordinator: SmartDehumidifierCoordinator) -> None:
        self.coordinator = coordinator
        self.key = KEY_AUTO
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{KEY_AUTO}"
        self._attr_name = "Auto Humidity"
        self._is_on = False
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.entry.entry_id)},
            name=coordinator.name,
            manufacturer="Smart Dehumidifier",
            model="Virtual Controller",
        )

    @property
    def is_on(self) -> bool:
        return self._is_on

    async def async_turn_on(self, **kwargs) -> None:
        self._is_on = True
        self.async_write_ha_state()
        await self.coordinator._async_sync_target_humidity()
        await self.coordinator._async_update_fan()
        await self.coordinator._async_update_status_sensor()

    async def async_turn_off(self, **kwargs) -> None:
        self._is_on = False
        self.async_write_ha_state()
        await self.coordinator._async_update_fan()
        await self.coordinator._async_update_status_sensor()
