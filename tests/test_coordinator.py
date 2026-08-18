"""Tests for SmartDehumidifierCoordinator."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.const import STATE_OFF, STATE_ON

from custom_components.smart_dehumidifier.const import (
    DEFAULT_DELTA,
    DEFAULT_MAX_RH,
    DEFAULT_MIN_RH,
    KEY_AUTO,
    KEY_DELTA,
    KEY_MAX_RH,
    KEY_MIN_RH,
    KEY_RECOMMENDED,
    KEY_STATUS,
    STATUS_AUTO,
    STATUS_MANUAL,
    STATUS_OFF,
    STATUS_ON,
    STATUS_PAUSED,
)
from custom_components.smart_dehumidifier.coordinator import SmartDehumidifierCoordinator
from pytest_homeassistant_custom_component.common import MockConfigEntry


@pytest.fixture
async def coordinator(hass: HomeAssistant, mock_config_entry: MockConfigEntry):
    mock_config_entry.add_to_hass(hass)
    coord = SmartDehumidifierCoordinator(hass, mock_config_entry)
    # Register mock entities
    auto = MagicMock()
    auto.entity_id = "switch.test_auto"
    auto.is_on = False
    coord.register_entity(KEY_AUTO, auto)

    status = MagicMock()
    status.async_write_ha_state = MagicMock()
    coord.register_entity(KEY_STATUS, status)

    rec = MagicMock()
    rec.async_write_ha_state = MagicMock()
    coord.register_entity(KEY_RECOMMENDED, rec)

    for key, default in [
        (KEY_DELTA, DEFAULT_DELTA),
        (KEY_MIN_RH, DEFAULT_MIN_RH),
        (KEY_MAX_RH, DEFAULT_MAX_RH),
    ]:
        num = MagicMock()
        num.entity_id = f"number.test_{key}"
        num.native_value = default
        coord.register_entity(key, num)

    return coord


async def test_compute_recommended_with_room(hass: HomeAssistant, coordinator):
    """Room RH + delta, clamped."""
    hass.states.async_set("sensor.room_humidity", "50")
    hass.states.async_set("sensor.bath_humidity", "70")
    # Mock number states
    hass.states.async_set("number.test_delta", "3")
    hass.states.async_set("number.test_min_rh", "45")
    hass.states.async_set("number.test_max_rh", "65")

    result = coordinator.compute_recommended_humidity()
    assert result == 53  # 50 + 3


async def test_compute_recommended_clamped(hass: HomeAssistant, coordinator):
    hass.states.async_set("sensor.room_humidity", "80")
    hass.states.async_set("number.test_delta", "3")
    hass.states.async_set("number.test_min_rh", "45")
    hass.states.async_set("number.test_max_rh", "65")

    result = coordinator.compute_recommended_humidity()
    assert result == 65


async def test_compute_recommended_no_sensors(hass: HomeAssistant, coordinator):
    # No room/bath states → midpoint
    hass.states.async_set("number.test_min_rh", "40")
    hass.states.async_set("number.test_max_rh", "60")
    result = coordinator.compute_recommended_humidity()
    assert result == 50


async def test_compute_recommended_unavailable_sensor(hass: HomeAssistant, coordinator):
    hass.states.async_set("sensor.room_humidity", "unavailable")
    hass.states.async_set("sensor.bath_humidity", "70")
    hass.states.async_set("number.test_min_rh", "45")
    hass.states.async_set("number.test_max_rh", "65")

    result = coordinator.compute_recommended_humidity()
    # Falls back to bathroom path
    assert result == 55  # min(70, 55)


async def test_status_off(hass: HomeAssistant, coordinator):
    hass.states.async_set("humidifier.test", STATE_OFF)
    assert coordinator.get_status() == STATUS_OFF


async def test_status_auto(hass: HomeAssistant, coordinator):
    hass.states.async_set("humidifier.test", STATE_ON)
    hass.states.async_set("switch.test_auto", STATE_ON)
    assert coordinator.get_status() == STATUS_AUTO


async def test_manual_toggle_cycle(hass: HomeAssistant, coordinator):
    hass.states.async_set("humidifier.test", STATE_ON)
    assert coordinator.get_status() == STATUS_ON

    await coordinator.async_manual_toggle()
    assert coordinator._manual_active is True
    assert coordinator.get_status() == STATUS_MANUAL

    await coordinator.async_manual_toggle()
    assert coordinator._pause_active is True
    assert coordinator.get_status() == STATUS_PAUSED

    await coordinator.async_manual_toggle()
    assert coordinator._manual_active is True
    assert coordinator.get_status() == STATUS_MANUAL


async def test_full_stop_clears_timers(hass: HomeAssistant, coordinator):
    hass.states.async_set("humidifier.test", STATE_ON)
    await coordinator.async_manual_toggle()
    assert coordinator._manual_active

    await coordinator.async_full_stop()
    assert not coordinator._manual_active
    assert not coordinator._pause_active
