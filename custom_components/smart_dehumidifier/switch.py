"""Switch platform for Smart Dehumidifier (Auto mode).

Created/removed with the device using the shared base entity lifecycle.
"""

from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN, KEY_AUTO
from .coordinator import SmartDehumidifierCoordinator
from .entity import SmartDehumidifierEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Create the Auto switch when the device is added."""
    coordinator: SmartDehumidifierCoordinator = hass.data[DOMAIN][entry.entry_id]
    entity = SmartDehumidifierAutoSwitch(coordinator)
    async_add_entities([entity])
    coordinator.register_entity(KEY_AUTO, entity)


class SmartDehumidifierAutoSwitch(SmartDehumidifierEntity, SwitchEntity, RestoreEntity):
    """Auto humidity mode — only meaningful with a room humidity sensor."""

    _attr_icon = "mdi:water-percent"
    _attr_name = "Auto Humidity"

    def __init__(self, coordinator: SmartDehumidifierCoordinator) -> None:
        super().__init__(coordinator)
        self.key = KEY_AUTO
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{KEY_AUTO}"
        self._is_on = False
        self._attr_entity_registry_enabled_default = coordinator.auto_mode_available

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if not self.coordinator.auto_mode_available:
            self._is_on = False
            return
        last = await self.async_get_last_state()
        if last is not None and last.state == "on":
            self._is_on = True
            self.hass.async_create_task(self.coordinator.async_sync_target_humidity())
            self.hass.async_create_task(self.coordinator.async_update_fan())

    @property
    def is_on(self) -> bool:
        if not self.coordinator.auto_mode_available:
            return False
        return self._is_on

    @property
    def available(self) -> bool:
        return self.coordinator.auto_mode_available

    async def async_turn_on(self, **kwargs) -> None:
        if not self.coordinator.auto_mode_available:
            self._is_on = False
            self.async_write_ha_state()
            return
        self._is_on = True
        self.async_write_ha_state()
        await self.coordinator.async_sync_target_humidity()
        await self.coordinator.async_update_fan()
        await self.coordinator.async_update_status_sensor()

    async def async_turn_off(self, **kwargs) -> None:
        self._is_on = False
        self.async_write_ha_state()
        await self.coordinator.async_update_fan()
        await self.coordinator.async_update_status_sensor()
