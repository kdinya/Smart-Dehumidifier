"""Number platform for Smart Dehumidifier settings."""

from __future__ import annotations

from homeassistant.components.number import NumberEntity, NumberMode, RestoreNumber
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo, EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    DEFAULT_DELTA,
    DEFAULT_MANUAL_RUNTIME,
    DEFAULT_MAX_RH,
    DEFAULT_MIN_RH,
    DEFAULT_PAUSE_RUNTIME,
    DOMAIN,
    KEY_DELTA,
    KEY_MANUAL_RUNTIME,
    KEY_MAX_RH,
    KEY_MIN_RH,
    KEY_PAUSE_RUNTIME,
    KEY_RECOMMENDED,
)
from .coordinator import SmartDehumidifierCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: SmartDehumidifierCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = [
        SmartDehumidifierNumber(
            coordinator, KEY_DELTA, "Delta", DEFAULT_DELTA, 0.0, 20.0, 0.5, PERCENTAGE
        ),
        SmartDehumidifierNumber(
            coordinator, KEY_MIN_RH, "Auto Min RH", DEFAULT_MIN_RH, 20.0, 90.0, 1.0, PERCENTAGE
        ),
        SmartDehumidifierNumber(
            coordinator, KEY_MAX_RH, "Auto Max RH", DEFAULT_MAX_RH, 30.0, 99.0, 1.0, PERCENTAGE
        ),
        SmartDehumidifierNumber(
            coordinator,
            KEY_MANUAL_RUNTIME,
            "Manual Runtime",
            DEFAULT_MANUAL_RUNTIME,
            1.0,
            240.0,
            1.0,
            UnitOfTime.MINUTES,
        ),
        SmartDehumidifierNumber(
            coordinator,
            KEY_PAUSE_RUNTIME,
            "Pause Runtime",
            DEFAULT_PAUSE_RUNTIME,
            1.0,
            240.0,
            1.0,
            UnitOfTime.MINUTES,
        ),
    ]
    async_add_entities(entities)
    for ent in entities:
        coordinator.register_entity(ent.key, ent)


class SmartDehumidifierNumber(RestoreNumber, NumberEntity):
    """Configurable number with state restore across restarts."""

    _attr_entity_category = EntityCategory.CONFIG
    _attr_entity_registry_enabled_default = True
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
        self._default = default
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.entry.entry_id)},
            name=coordinator.name,
            manufacturer="Smart Dehumidifier",
            model="Virtual Controller",
        )

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_number_data()
        if last and last.native_value is not None:
            self._attr_native_value = last.native_value

    async def async_set_native_value(self, value: float) -> None:
        self._attr_native_value = value
        self.async_write_ha_state()
        # Delta / min / max → recalculate recommended and push if auto
        if self.key in (KEY_MIN_RH, KEY_MAX_RH, KEY_DELTA):
            rec = self.coordinator.entities.get(KEY_RECOMMENDED)
            if rec and hasattr(rec, "async_write_ha_state"):
                rec.async_write_ha_state()
            if self.coordinator.is_auto_on():
                await self.coordinator.async_sync_target_humidity()
