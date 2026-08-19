"""Base entities for Smart Dehumidifier.

Mirrors the clean create/remove listener pattern from My-Dehumidifier:
entities register on async_added_to_hass and unregister on
async_will_remove_from_hass so nothing is left after device removal.
"""

from __future__ import annotations

from homeassistant.helpers.entity import DeviceInfo, Entity

from .const import DOMAIN, VERSION
from .coordinator import SmartDehumidifierCoordinator


class SmartDehumidifierEntity(Entity):
    """Common entity metadata and lifecycle for all Smart Dehumidifier entities."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, coordinator: SmartDehumidifierCoordinator) -> None:
        self.coordinator = coordinator
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.entry.entry_id)},
            name=coordinator.name,
            manufacturer="Smart Dehumidifier",
            model="Virtual Controller",
            sw_version=VERSION,
        )

    async def async_added_to_hass(self) -> None:
        """Register for coordinator state updates when the entity is created."""
        self.coordinator.add_listener(self.async_write_ha_state)

    async def async_will_remove_from_hass(self) -> None:
        """Unregister when the entity (or whole device) is removed."""
        self.coordinator.remove_listener(self.async_write_ha_state)
