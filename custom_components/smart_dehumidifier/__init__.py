"""Smart Dehumidifier integration."""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_ENTITY_ID,
    EVENT_HOMEASSISTANT_STARTED,
    STATE_OFF,
    STATE_ON,
    Platform,
)
from homeassistant.core import Event, HomeAssistant, State, callback, ServiceCall
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_call_later,
)
from homeassistant.helpers.typing import ConfigType

from .const import (
    CONF_FAN,
    CONF_HUMIDIFIER,
    CONF_NAME,
    CONF_PREFIX,
    DOMAIN,
    KEY_AUTO,
    KEY_DELTA,
    KEY_MANUAL_ACTIVE,
    KEY_MANUAL_RUNTIME,
    KEY_MAX_RH,
    KEY_MIN_RH,
    KEY_PAUSE_ACTIVE,
    KEY_PAUSE_RUNTIME,
    KEY_RECOMMENDED,
    KEY_STATUS,
    VERSION,
)

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.SWITCH,
    Platform.NUMBER,
    Platform.BUTTON,
]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Smart Dehumidifier component."""
    hass.data.setdefault(DOMAIN, {})
    from .frontend import async_register_frontend
    await async_register_frontend(hass)
    return True



async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Smart Dehumidifier from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Ensure card is served even if async_setup was skipped
    from .frontend import async_register_frontend
    await async_register_frontend(hass)

    coordinator = SmartDehumidifierCoordinator(hass, entry)
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await coordinator.async_setup()

    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    # Register service for manual toggle (extra convenience)
    async def handle_manual_toggle(call: ServiceCall) -> None:
        target_entry_id = call.data.get("entry_id", entry.entry_id)
        coord = hass.data[DOMAIN].get(target_entry_id)
        if coord:
            await coord.async_manual_toggle()

    if not hass.services.has_service(DOMAIN, "manual_toggle"):
        hass.services.async_register(
            DOMAIN,
            "manual_toggle",
            handle_manual_toggle,
            schema=None,
        )

    _LOGGER.info("Smart Dehumidifier %s loaded for %s", VERSION, entry.title)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        coordinator: SmartDehumidifierCoordinator = hass.data[DOMAIN].pop(entry.entry_id, None)
        if coordinator:
            await coordinator.async_unload()
    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)


class SmartDehumidifierCoordinator:
    """Coordinates logic between humidifier, fan, auto mode and manual timers."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.humidifier_entity: str = entry.data[CONF_HUMIDIFIER]
        self.fan_entity: str | None = entry.data.get(CONF_FAN)
        self.prefix: str = entry.data.get(CONF_PREFIX, "sd")
        self.name: str = entry.data.get(CONF_NAME, "Smart Dehumidifier")

        # Runtime state (not persisted entities)
        self._manual_active = False
        self._pause_active = False
        self._manual_cancel = None
        self._pause_cancel = None
        self._unsubs: list = []

        # Will be set by platforms after they are created
        self.entities: dict[str, Any] = {}

    @property
    def unique_prefix(self) -> str:
        return f"{self.prefix}_{self.entry.entry_id[:8]}"

    async def async_setup(self) -> None:
        """Start listening to state changes."""
        entities_to_track = [self.humidifier_entity]
        if self.fan_entity:
            entities_to_track.append(self.fan_entity)

        self._unsubs.append(
            async_track_state_change_event(
                self.hass, entities_to_track, self._async_state_changed
            )
        )

        # Also track our own switch/number entities once they exist
        @callback
        def _ha_started(_event: Event) -> None:
            self.hass.async_create_task(self._async_after_start())

        if self.hass.is_running:
            await self._async_after_start()
        else:
            self._unsubs.append(
                self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _ha_started)
            )

    async def _async_after_start(self) -> None:
        """Track auto switch after entities are ready."""
        # We will re-track when entities register themselves
        await self._async_update_fan()

    async def async_unload(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        if self._manual_cancel:
            self._manual_cancel()
        if self._pause_cancel:
            self._pause_cancel()

    def register_entity(self, key: str, entity: Any) -> None:
        """Called by platform entities to register themselves."""
        self.entities[key] = entity

    def get_entity_id(self, key: str) -> str | None:
        ent = self.entities.get(key)
        if ent and hasattr(ent, "entity_id"):
            return ent.entity_id
        return None

    # ------------------------------------------------------------------
    # State helpers
    # ------------------------------------------------------------------

    def _is_humidifier_on(self) -> bool:
        state = self.hass.states.get(self.humidifier_entity)
        return state is not None and state.state not in (STATE_OFF, "unavailable", "unknown", None)

    def _get_number(self, key: str, default: float) -> float:
        ent_id = self.get_entity_id(key)
        if not ent_id:
            return default
        state = self.hass.states.get(ent_id)
        if state is None or state.state in ("unavailable", "unknown"):
            return default
        try:
            return float(state.state)
        except (ValueError, TypeError):
            return default

    def _is_auto_on(self) -> bool:
        ent_id = self.get_entity_id(KEY_AUTO)
        if not ent_id:
            return False
        state = self.hass.states.get(ent_id)
        return state is not None and state.state == STATE_ON

    # ------------------------------------------------------------------
    # Core logic (mirrors original automations)
    # ------------------------------------------------------------------

    async def _async_state_changed(self, event: Event) -> None:
        entity_id = event.data.get("entity_id")
        new_state: State | None = event.data.get("new_state")
        old_state: State | None = event.data.get("old_state")

        if entity_id == self.humidifier_entity:
            if new_state and new_state.state == STATE_OFF:
                # Full Stop
                await self._async_full_stop()
            else:
                await self._async_update_fan()
                await self._async_sync_target_humidity()

        elif entity_id == self.fan_entity and self.fan_entity:
            if new_state and old_state:
                if new_state.state == STATE_ON and old_state.state != STATE_ON:
                    # Physical Fan ON → start/resume manual
                    if self._pause_active:
                        await self.async_manual_toggle()
                    elif not self._is_auto_on() and not self._manual_active and not self._pause_active:
                        await self.async_manual_toggle()
                elif new_state.state == STATE_OFF and old_state.state != STATE_OFF:
                    # Physical Fan OFF during manual → pause
                    if self._manual_active:
                        await self.async_manual_toggle()

        await self._async_update_status_sensor()

    async def _async_full_stop(self) -> None:
        """Cancel timers and turn off auto when dehumidifier is turned off."""
        if self._manual_cancel:
            self._manual_cancel()
            self._manual_cancel = None
        if self._pause_cancel:
            self._pause_cancel()
            self._pause_cancel = None
        self._manual_active = False
        self._pause_active = False

        auto_id = self.get_entity_id(KEY_AUTO)
        if auto_id and self._is_auto_on():
            await self.hass.services.async_call(
                "switch", "turn_off", {ATTR_ENTITY_ID: auto_id}, blocking=True
            )

        if self.fan_entity:
            await self.hass.services.async_call(
                "switch", "turn_off", {ATTR_ENTITY_ID: self.fan_entity}, blocking=False
            )

        await self._async_update_status_sensor()

    async def _async_sync_target_humidity(self) -> None:
        """Sync humidifier target humidity when auto is on."""
        if not self._is_auto_on() or not self._is_humidifier_on():
            return

        recommended = self._get_number(KEY_RECOMMENDED, 50)
        # Prefer the calculated recommended sensor if available
        rec_id = self.get_entity_id(KEY_RECOMMENDED)
        if rec_id:
            state = self.hass.states.get(rec_id)
            if state and state.state not in ("unavailable", "unknown"):
                try:
                    recommended = int(float(state.state))
                except (ValueError, TypeError):
                    pass

        await self.hass.services.async_call(
            "humidifier",
            "set_humidity",
            {
                ATTR_ENTITY_ID: self.humidifier_entity,
                "humidity": int(recommended),
            },
            blocking=False,
        )

    async def _async_update_fan(self) -> None:
        """Master Fan Controller."""
        if not self.fan_entity:
            return

        if not self._is_humidifier_on():
            await self.hass.services.async_call(
                "switch", "turn_off", {ATTR_ENTITY_ID: self.fan_entity}, blocking=False
            )
            return

        if self._pause_active:
            await self.hass.services.async_call(
                "switch", "turn_off", {ATTR_ENTITY_ID: self.fan_entity}, blocking=False
            )
            return

        if self._manual_active or self._is_auto_on():
            await self.hass.services.async_call(
                "switch", "turn_on", {ATTR_ENTITY_ID: self.fan_entity}, blocking=False
            )
        else:
            await self.hass.services.async_call(
                "switch", "turn_off", {ATTR_ENTITY_ID: self.fan_entity}, blocking=False
            )

    async def async_manual_toggle(self) -> None:
        """Toggle manual mode / pause (same as original script)."""
        if self._pause_active:
            # Resume from pause → start manual
            if self._pause_cancel:
                self._pause_cancel()
                self._pause_cancel = None
            self._pause_active = False
            await self._start_manual_timer()
        elif self._manual_active:
            # Manual active → go to pause
            if self._manual_cancel:
                self._manual_cancel()
                self._manual_cancel = None
            self._manual_active = False
            await self._start_pause_timer()
        else:
            # Idle → start manual
            await self._start_manual_timer()

        await self._async_update_fan()
        await self._async_update_status_sensor()

    async def _start_manual_timer(self) -> None:
        runtime_min = self._get_number(KEY_MANUAL_RUNTIME, 20)
        self._manual_active = True
        self._pause_active = False

        def _expired(_now):
            self.hass.async_create_task(self._on_manual_expired())

        if self._manual_cancel:
            self._manual_cancel()
        self._manual_cancel = async_call_later(
            self.hass, timedelta(minutes=runtime_min), _expired
        )

    async def _start_pause_timer(self) -> None:
        runtime_min = self._get_number(KEY_PAUSE_RUNTIME, 20)
        self._pause_active = True
        self._manual_active = False

        def _expired(_now):
            self.hass.async_create_task(self._on_pause_expired())

        if self._pause_cancel:
            self._pause_cancel()
        self._pause_cancel = async_call_later(
            self.hass, timedelta(minutes=runtime_min), _expired
        )

    async def _on_manual_expired(self) -> None:
        self._manual_active = False
        self._manual_cancel = None
        await self._async_update_fan()
        await self._async_update_status_sensor()

    async def _on_pause_expired(self) -> None:
        self._pause_active = False
        self._pause_cancel = None
        await self._async_update_fan()
        await self._async_update_status_sensor()

    async def _async_update_status_sensor(self) -> None:
        """Force status sensor to refresh."""
        status_ent = self.entities.get(KEY_STATUS)
        if status_ent and hasattr(status_ent, "async_write_ha_state"):
            status_ent.async_write_ha_state()

    def get_status(self) -> str:
        if not self._is_humidifier_on():
            return "off"
        if self._pause_active:
            return "paused"
        if self._manual_active:
            return "manual"
        if self._is_auto_on():
            return "auto"
        return "on"

    def get_status_label(self) -> str:
        mapping = {
            "off": "Вимкнено",
            "paused": "Пауза",
            "manual": "Ручний",
            "auto": "Авто",
            "on": "Увімкнено",
        }
        return mapping.get(self.get_status(), "Увімкнено")
