"""Switch platform for Smart Dehumidifier (Auto mode)."""

from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN, KEY_AUTO
from .coordinator import SmartDehumidifierCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: SmartDehumidifierCoordinator = hass.data[DOMAIN][entry.entry_id]
    entity = SmartDehumidifierAutoSwitch(coordinator)
    async_add_entities([entity])
    coordinator.register_entity(KEY_AUTO, entity)


class SmartDehumidifierAutoSwitch(SwitchEntity, RestoreEntity):
    """Auto humidity mode switch. State is restored across restarts."""

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

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None and last.state == "on":
            self._is_on = True
            # Re-sync after restore if needed
            self.hass.async_create_task(self.coordinator.async_sync_target_humidity())
            self.hass.async_create_task(self.coordinator.async_update_fan())

    @property
    def is_on(self) -> bool:
        return self._is_on

    async def async_turn_on(self, **kwargs) -> None:
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
