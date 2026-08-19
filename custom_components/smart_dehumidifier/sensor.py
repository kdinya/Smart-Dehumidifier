"""Sensor platform for Smart Dehumidifier.

Entities are created with the device and removed cleanly via base lifecycle.
"""

from __future__ import annotations

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, KEY_RECOMMENDED, KEY_STATUS
from .coordinator import SmartDehumidifierCoordinator
from .entity import SmartDehumidifierEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Create status and recommended sensors when the device is added."""
    coordinator: SmartDehumidifierCoordinator = hass.data[DOMAIN][entry.entry_id]
    entities = [
        SmartDehumidifierStatusSensor(coordinator),
        SmartDehumidifierRecommendedSensor(coordinator),
    ]
    async_add_entities(entities)
    for ent in entities:
        if hasattr(ent, "key"):
            coordinator.register_entity(ent.key, ent)


class SmartDehumidifierBaseSensor(SmartDehumidifierEntity, SensorEntity):
    def __init__(
        self, coordinator: SmartDehumidifierCoordinator, key: str, name: str
    ) -> None:
        super().__init__(coordinator)
        self.key = key
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{key}"
        self._attr_name = name


class SmartDehumidifierStatusSensor(SmartDehumidifierBaseSensor):
    def __init__(self, coordinator: SmartDehumidifierCoordinator) -> None:
        super().__init__(coordinator, KEY_STATUS, "Status")
        self._attr_icon = "mdi:air-humidifier"

    @property
    def native_value(self) -> str:
        return self.coordinator.get_status()

    @property
    def extra_state_attributes(self) -> dict:
        return self.coordinator.get_status_attributes()


class SmartDehumidifierRecommendedSensor(SmartDehumidifierBaseSensor):
    """Recommended target humidity: room RH + delta (auto mode only)."""

    def __init__(self, coordinator: SmartDehumidifierCoordinator) -> None:
        super().__init__(coordinator, KEY_RECOMMENDED, "Recommended Humidity")
        self._attr_native_unit_of_measurement = "%"
        self._attr_icon = "mdi:water-percent"
        self._attr_device_class = SensorDeviceClass.HUMIDITY
        self._attr_entity_registry_enabled_default = coordinator.auto_mode_available

    @property
    def available(self) -> bool:
        return self.coordinator.auto_mode_available

    @property
    def native_value(self) -> int | None:
        if not self.coordinator.auto_mode_available:
            return None
        return self.coordinator.compute_recommended_humidity()

    @property
    def extra_state_attributes(self) -> dict:
        return self.coordinator.recommended_attributes()
