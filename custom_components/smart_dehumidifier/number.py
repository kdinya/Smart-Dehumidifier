"""Number platform for Smart Dehumidifier settings."""

from __future__ import annotations

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.const import PERCENTAGE, UnitOfTime

from .const import (
    KEY_RECOMMENDED,
    DOMAIN,
    KEY_DELTA,
    KEY_MIN_RH,
    KEY_MAX_RH,
    KEY_MANUAL_RUNTIME,
    KEY_PAUSE_RUNTIME,
    DEFAULT_DELTA,
    DEFAULT_MIN_RH,
    DEFAULT_MAX_RH,
    DEFAULT_MANUAL_RUNTIME,
    DEFAULT_PAUSE_RUNTIME,
)
from . import SmartDehumidifierCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: SmartDehumidifierCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = [
        SmartDehumidifierNumber(
            coordinator, KEY_DELTA, "Delta", DEFAULT_DELTA, 0.5, 15, 0.5, PERCENTAGE
        ),
        SmartDehumidifierNumber(
            coordinator, KEY_MIN_RH, "Auto Min RH", DEFAULT_MIN_RH, 30, 80, 1, PERCENTAGE
        ),
        SmartDehumidifierNumber(
            coordinator, KEY_MAX_RH, "Auto Max RH", DEFAULT_MAX_RH, 40, 95, 1, PERCENTAGE
        ),
        SmartDehumidifierNumber(
            coordinator,
            KEY_MANUAL_RUNTIME,
            "Manual Runtime",
            DEFAULT_MANUAL_RUNTIME,
            5,
            180,
            5,
            UnitOfTime.MINUTES,
        ),
        SmartDehumidifierNumber(
            coordinator,
            KEY_PAUSE_RUNTIME,
            "Pause Runtime",
            DEFAULT_PAUSE_RUNTIME,
            5,
            180,
            5,
            UnitOfTime.MINUTES,
        ),
    ]
    async_add_entities(entities)
    for ent in entities:
        coordinator.register_entity(ent.key, ent)


class SmartDehumidifierNumber(NumberEntity):
    """Generic number entity for settings."""

    _attr_has_entity_name = True
    _attr_mode = NumberMode.SLIDER
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: SmartDehumidifierCoordinator,
        key: str,
        name: str,
        default: float,
        min_val: float,
        max_val: float,
        step: float,
        unit: str | None,
    ) -> None:
        self.coordinator = coordinator
        self.key = key
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{key}"
        self._attr_name = name
        self._attr_native_min_value = min_val
        self._attr_native_max_value = max_val
        self._attr_native_step = step
        self._attr_native_unit_of_measurement = unit
        self._attr_native_value = default
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.entry.entry_id)},
            name=coordinator.name,
            manufacturer="Smart Dehumidifier",
            model="Virtual Controller",
        )

    async def async_set_native_value(self, value: float) -> None:
        self._attr_native_value = value
        self.async_write_ha_state()
        # If min/max changed, recommended sensor should update
        if self.key in (KEY_MIN_RH, KEY_MAX_RH):
            rec = self.coordinator.entities.get(KEY_RECOMMENDED)
            if rec:
                rec.async_write_ha_state()
            if self.coordinator._is_auto_on():
                await self.coordinator._async_sync_target_humidity()
