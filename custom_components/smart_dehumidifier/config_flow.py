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


def _user_schema() -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(CONF_NAME, default=DEFAULT_NAME): str,
            vol.Required(CONF_HUMIDIFIER): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="humidifier")
            ),
            vol.Optional(CONF_FAN): selector.EntitySelector(
                selector.EntitySelectorConfig(domain=["switch", "fan"])
            ),
            vol.Optional(CONF_BATHROOM_HUMIDITY): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="sensor", device_class=["humidity"])
            ),
            vol.Optional(CONF_ROOM_HUMIDITY): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="sensor", device_class=["humidity"])
            ),
            vol.Optional(CONF_PREFIX, default=DEFAULT_PREFIX): str,
        }
    )


class SmartDehumidifierConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 2

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            humidifier = user_input[CONF_HUMIDIFIER]
            prefix = (user_input.get(CONF_PREFIX) or DEFAULT_PREFIX).strip().lower()
            prefix = "".join(c if c.isalnum() or c == "_" else "_" for c in prefix) or DEFAULT_PREFIX

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

        return self.async_show_form(step_id="user", data_schema=_user_schema(), errors=errors)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry):
        return SmartDehumidifierOptionsFlow(config_entry)


class SmartDehumidifierOptionsFlow(config_entries.OptionsFlow):
    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self.config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        if user_input is not None:
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
                        CONF_BATHROOM_HUMIDITY, default=data.get(CONF_BATHROOM_HUMIDITY)
                    ): selector.EntitySelector(
                        selector.EntitySelectorConfig(domain="sensor", device_class=["humidity"])
                    ),
                    vol.Optional(
                        CONF_ROOM_HUMIDITY, default=data.get(CONF_ROOM_HUMIDITY)
                    ): selector.EntitySelector(
                        selector.EntitySelectorConfig(domain="sensor", device_class=["humidity"])
                    ),
                }
            ),
        )
