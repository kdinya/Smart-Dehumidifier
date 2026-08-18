"""Sensor platform for Smart Dehumidifier."""

from __future__ import annotations

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, KEY_RECOMMENDED, KEY_STATUS, VERSION
from .coordinator import SmartDehumidifierCoordinator


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
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self, coordinator: SmartDehumidifierCoordinator, key: str, name: str
    ) -> None:
        self.coordinator = coordinator
        self.key = key
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{key}"
        self._attr_name = name
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.entry.entry_id)},
            name=coordinator.name,
            manufacturer="Smart Dehumidifier",
            model="Virtual Controller",
            sw_version=VERSION,
        )


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
    """Recommended target humidity based on adjacent room RH + delta."""

    def __init__(self, coordinator: SmartDehumidifierCoordinator) -> None:
        super().__init__(coordinator, KEY_RECOMMENDED, "Recommended Humidity")
        self._attr_native_unit_of_measurement = "%"
        self._attr_icon = "mdi:water-percent"
        self._attr_device_class = SensorDeviceClass.HUMIDITY

    @property
    def native_value(self) -> int:
        return self.coordinator.compute_recommended_humidity()

    @property
    def extra_state_attributes(self) -> dict:
        return self.coordinator.recommended_attributes()
