"""Tests for config flow."""

from __future__ import annotations

from unittest.mock import patch

import pytest
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.smart_dehumidifier.const import (
    CONF_HUMIDIFIER,
    CONF_NAME,
    DOMAIN,
)


async def test_form_user(hass: HomeAssistant):
    """Test we get the form."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] == FlowResultType.FORM
    assert result["errors"] == {}


async def test_form_invalid_entity(hass: HomeAssistant):
    """Test validation rejects non-existent humidifier."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            CONF_NAME: "Test",
            CONF_HUMIDIFIER: "humidifier.does_not_exist",
        },
    )
    assert result["type"] == FlowResultType.FORM
    assert "errors" in result
    assert result["errors"].get(CONF_HUMIDIFIER) == "entity_not_found"


async def test_form_success(hass: HomeAssistant):
    """Test successful creation when entity exists."""
    hass.states.async_set("humidifier.real", "off")

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            CONF_NAME: "Bathroom SD",
            CONF_HUMIDIFIER: "humidifier.real",
        },
    )
    assert result["type"] == FlowResultType.CREATE_ENTRY
    assert result["title"] == "Bathroom SD"
    assert result["data"][CONF_HUMIDIFIER] == "humidifier.real"
