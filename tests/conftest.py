"""Shared fixtures for Smart Dehumidifier tests."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.smart_dehumidifier.const import (
    CONF_BATHROOM_HUMIDITY,
    CONF_FAN,
    CONF_HUMIDIFIER,
    CONF_NAME,
    CONF_PREFIX,
    CONF_ROOM_HUMIDITY,
    DOMAIN,
)


@pytest.fixture
def mock_config_entry() -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        title="Test SD",
        data={
            CONF_NAME: "Test SD",
            CONF_HUMIDIFIER: "humidifier.test",
            CONF_FAN: "switch.test_fan",
            CONF_BATHROOM_HUMIDITY: "sensor.bath_humidity",
            CONF_ROOM_HUMIDITY: "sensor.room_humidity",
            CONF_PREFIX: "sd",
        },
        entry_id="test_entry_12345678",
    )


@pytest.fixture
def mock_humidifier_state():
    state = MagicMock()
    state.state = "on"
    state.attributes = {"humidity": 50}
    return state


@pytest.fixture
def mock_sensor_state():
    state = MagicMock()
    state.state = "55.0"
    return state
