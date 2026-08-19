"""Button platform for manual toggle.

Created when the device is set up; removed cleanly via base entity
async_will_remove_from_hass + platform unload (same pattern as My-Dehumidifier).
"""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, KEY_MANUAL_TOGGLE
from .coordinator import SmartDehumidifierCoordinator
from .entity import SmartDehumidifierEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Create the Manual button when the device is added."""
    coordinator: SmartDehumidifierCoordinator = hass.data[DOMAIN][entry.entry_id]
    entity = SmartDehumidifierManualButton(coordinator)
    async_add_entities([entity])
    coordinator.register_entity(KEY_MANUAL_TOGGLE, entity)


class SmartDehumidifierManualButton(SmartDehumidifierEntity, ButtonEntity):
    """Button that toggles manual / pause mode (Idle → Manual → Pause)."""

    _attr_icon = "mdi:hand"
    _attr_name = "Manual"

    def __init__(self, coordinator: SmartDehumidifierCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{KEY_MANUAL_TOGGLE}"

    async def async_press(self) -> None:
        await self.coordinator.async_manual_toggle()
