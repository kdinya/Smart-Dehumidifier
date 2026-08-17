"""Sensor platform for Smart Dehumidifier."""

from __future__ import annotations

from homeassistant.components.sensor import SensorEntity, SensorDeviceClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.entity import DeviceInfo

from .const import DOMAIN, KEY_RECOMMENDED, KEY_STATUS, KEY_MIN_RH, KEY_MAX_RH
from . import SmartDehumidifierCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: SmartDehumidifierCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = [
        SmartDehumidifierStatusSensor(coordinator),
        SmartDehumidifierRecommendedSensor(coordinator),
    ]
    async_add_entities(entities)

    for ent in entities:
        if hasattr(ent, "key"):
            coordinator.register_entity(ent.key, ent)


class SmartDehumidifierBaseSensor(SensorEntity):
    """Base sensor."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, coordinator: SmartDehumidifierCoordinator, key: str, name: str) -> None:
        self.coordinator = coordinator
        self.key = key
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{key}"
        self._attr_name = name
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.entry.entry_id)},
            name=coordinator.name,
            manufacturer="Smart Dehumidifier",
            model="Virtual Controller",
            sw_version="1.3.0",
        )


class SmartDehumidifierStatusSensor(SmartDehumidifierBaseSensor):
    """Status sensor (off / auto / manual / paused / on)."""

    def __init__(self, coordinator: SmartDehumidifierCoordinator) -> None:
        super().__init__(coordinator, KEY_STATUS, "Status")
        self._attr_icon = "mdi:air-humidifier"

    @property
    def native_value(self) -> str:
        return self.coordinator.get_status()

    @property
    def extra_state_attributes(self) -> dict:
        return {
            "label": self.coordinator.get_status_label(),
            "manual_active": self.coordinator._manual_active,
            "pause_active": self.coordinator._pause_active,
        }


class SmartDehumidifierRecommendedSensor(SmartDehumidifierBaseSensor):
    """Recommended target humidity (average of min/max)."""

    def __init__(self, coordinator: SmartDehumidifierCoordinator) -> None:
        super().__init__(coordinator, KEY_RECOMMENDED, "Recommended Humidity")
        self._attr_native_unit_of_measurement = "%"
        self._attr_icon = "mdi:water-percent"
        self._attr_device_class = SensorDeviceClass.HUMIDITY

    @property
    def native_value(self) -> int:
        min_rh = self.coordinator._get_number(KEY_MIN_RH, 65)
        max_rh = self.coordinator._get_number(KEY_MAX_RH, 85)
        return round((min_rh + max_rh) / 2)
