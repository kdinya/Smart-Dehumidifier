"""Config flow for Smart Dehumidifier."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector

from .const import (
    CONF_BATHROOM_HUMIDITY,
    CONF_FAN,
    CONF_HUMIDIFIER,
    CONF_PREFIX,
    CONF_ROOM_HUMIDITY,
    DEFAULT_NAME,
    DEFAULT_PREFIX,
    DOMAIN,
)


def _user_schema(defaults: dict[str, Any] | None = None) -> vol.Schema:
    defaults = defaults or {}
    return vol.Schema(
        {
            vol.Required(
                CONF_NAME, default=defaults.get(CONF_NAME, DEFAULT_NAME)
            ): str,
            vol.Required(CONF_HUMIDIFIER): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="humidifier")
            ),
            vol.Optional(CONF_FAN): selector.EntitySelector(
                selector.EntitySelectorConfig(domain=["switch", "fan"])
            ),
            vol.Optional(CONF_BATHROOM_HUMIDITY): selector.EntitySelector(
                selector.EntitySelectorConfig(
                    domain="sensor", device_class=["humidity"]
                )
            ),
            vol.Optional(CONF_ROOM_HUMIDITY): selector.EntitySelector(
                selector.EntitySelectorConfig(
                    domain="sensor", device_class=["humidity"]
                )
            ),
            vol.Optional(
                CONF_PREFIX, default=defaults.get(CONF_PREFIX, DEFAULT_PREFIX)
            ): str,
        }
    )


async def _validate_entities(
    hass: HomeAssistant, user_input: dict[str, Any]
) -> dict[str, str]:
    """Return errors dict if any required entity is missing/unavailable."""
    errors: dict[str, str] = {}

    humidifier = user_input.get(CONF_HUMIDIFIER)
    if not humidifier:
        errors[CONF_HUMIDIFIER] = "required"
    else:
        state = hass.states.get(humidifier)
        if state is None:
            errors[CONF_HUMIDIFIER] = "entity_not_found"

    for key in (CONF_FAN, CONF_BATHROOM_HUMIDITY, CONF_ROOM_HUMIDITY):
        eid = user_input.get(key)
        if eid:
            state = hass.states.get(eid)
            if state is None:
                errors[key] = "entity_not_found"

    return errors


class SmartDehumidifierConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Smart Dehumidifier."""

    VERSION = 2

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            errors = await _validate_entities(self.hass, user_input)
            if not errors:
                humidifier = user_input[CONF_HUMIDIFIER]
                prefix = (user_input.get(CONF_PREFIX) or DEFAULT_PREFIX).strip().lower()
                prefix = (
                    "".join(c if c.isalnum() or c == "_" else "_" for c in prefix)
                    or DEFAULT_PREFIX
                )

                await self.async_set_unique_id(f"{DOMAIN}_{humidifier}")
                self._abort_if_unique_id_configured()

                return self.async_create_entry(
                    title=user_input.get(CONF_NAME) or DEFAULT_NAME,
                    data={
                        CONF_NAME: user_input.get(CONF_NAME) or DEFAULT_NAME,
                        CONF_HUMIDIFIER: humidifier,
                        CONF_FAN: user_input.get(CONF_FAN),
                        CONF_BATHROOM_HUMIDITY: user_input.get(CONF_BATHROOM_HUMIDITY),
                        CONF_ROOM_HUMIDITY: user_input.get(CONF_ROOM_HUMIDITY),
                        CONF_PREFIX: prefix,
                    },
                )

        return self.async_show_form(
            step_id="user",
            data_schema=_user_schema(),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> SmartDehumidifierOptionsFlow:
        """Create the options flow (HA injects config_entry automatically)."""
        return SmartDehumidifierOptionsFlow()


class SmartDehumidifierOptionsFlow(config_entries.OptionsFlow):
    """Handle options for Smart Dehumidifier.

    Compatible with Home Assistant 2025.12+ where config_entry is a
    read-only property provided by the base class.
    """

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # Options flow does not re-validate the humidifier (it is in data).
            # Only optional entities are present.
            for key in (CONF_FAN, CONF_BATHROOM_HUMIDITY, CONF_ROOM_HUMIDITY):
                eid = user_input.get(key)
                if eid and self.hass.states.get(eid) is None:
                    errors[key] = "entity_not_found"
            if not errors:
                return self.async_create_entry(title="", data=user_input)

        data = {**self.config_entry.data, **self.config_entry.options}
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_FAN, default=data.get(CONF_FAN)
                    ): selector.EntitySelector(
                        selector.EntitySelectorConfig(domain=["switch", "fan"])
                    ),
                    vol.Optional(
                        CONF_BATHROOM_HUMIDITY,
                        default=data.get(CONF_BATHROOM_HUMIDITY),
                    ): selector.EntitySelector(
                        selector.EntitySelectorConfig(
                            domain="sensor", device_class=["humidity"]
                        )
                    ),
                    vol.Optional(
                        CONF_ROOM_HUMIDITY, default=data.get(CONF_ROOM_HUMIDITY)
                    ): selector.EntitySelector(
                        selector.EntitySelectorConfig(
                            domain="sensor", device_class=["humidity"]
                        )
                    ),
                }
            ),
            errors=errors,
        )
