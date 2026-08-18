"""Coordinator for Smart Dehumidifier logic."""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.const import ATTR_ENTITY_ID, STATE_OFF, STATE_ON
from homeassistant.core import Event, HomeAssistant, State, callback
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
)

from .const import (
    ATTR_BATHROOM_HUMIDITY,
    ATTR_DELTA,
    ATTR_MANUAL_ACTIVE,
    ATTR_MAX_RH,
    ATTR_MIN_RH,
    ATTR_MODE,
    ATTR_PAUSE_ACTIVE,
    ATTR_LABEL,
    ATTR_ROOM_HUMIDITY,
    AUTO_MODE_KEYS,
    CONF_BATHROOM_HUMIDITY,
    CONF_FAN,
    CONF_HUMIDIFIER,
    CONF_NAME,
    CONF_PREFIX,
    CONF_ROOM_HUMIDITY,
    DEFAULT_DELTA,
    DEFAULT_MANUAL_RUNTIME,
    DEFAULT_MAX_RH,
    DEFAULT_MIN_RH,
    DEFAULT_NAME,
    DEFAULT_PAUSE_RUNTIME,
    DEFAULT_PREFIX,
    KEY_AUTO,
    KEY_DELTA,
    KEY_MANUAL_RUNTIME,
    KEY_MAX_RH,
    KEY_MIN_RH,
    KEY_PAUSE_RUNTIME,
    KEY_RECOMMENDED,
    KEY_STATUS,
    STATUS_AUTO,
    STATUS_LABELS,
    STATUS_MANUAL,
    STATUS_OFF,
    STATUS_ON,
    STATUS_PAUSED,
)

_LOGGER = logging.getLogger(__name__)


class SmartDehumidifierCoordinator:
    """Coordinates humidifier, fan, auto mode and manual/pause timers.

    Event-driven (state change listeners). No polling.
    Public methods are safe to call from platforms and services.
    """

    def __init__(self, hass: HomeAssistant, entry) -> None:
        self.hass = hass
        self.entry = entry
        data = {**entry.data, **entry.options}

        self.humidifier_entity: str = data[CONF_HUMIDIFIER]
        self.fan_entity: str | None = data.get(CONF_FAN)
        self.bathroom_humidity_entity: str | None = data.get(CONF_BATHROOM_HUMIDITY)
        self.room_humidity_entity: str | None = data.get(CONF_ROOM_HUMIDITY)
        self.prefix: str = data.get(CONF_PREFIX, DEFAULT_PREFIX)
        self.name: str = data.get(CONF_NAME, DEFAULT_NAME)

        # Transient runtime state (not restored across restarts by design)
        self._manual_active = False
        self._pause_active = False
        self._manual_cancel = None
        self._pause_cancel = None
        self._unsubs: list = []

        # Filled by platforms after entity creation
        self.entities: dict[str, Any] = {}

    @property
    def unique_prefix(self) -> str:
        return f"{self.prefix}_{self.entry.entry_id[:8]}"

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def async_setup(self) -> None:
        """Start listening to relevant state changes."""
        entities_to_track = [self.humidifier_entity]
        if self.fan_entity:
            entities_to_track.append(self.fan_entity)
        if self.bathroom_humidity_entity:
            entities_to_track.append(self.bathroom_humidity_entity)
        if self.room_humidity_entity:
            entities_to_track.append(self.room_humidity_entity)

        self._unsubs.append(
            async_track_state_change_event(
                self.hass, entities_to_track, self._async_state_changed
            )
        )

        if self.hass.is_running:
            await self._async_after_start()
        else:
            from homeassistant.const import EVENT_HOMEASSISTANT_STARTED

            @callback
            def _ha_started(_event: Event) -> None:
                self.hass.async_create_task(self._async_after_start())

            self._unsubs.append(
                self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _ha_started)
            )

    async def _async_after_start(self) -> None:
        """Initial fan sync and entity visibility after entities are ready."""
        await self.async_sync_auto_entity_visibility()
        await self.async_update_fan()

    async def async_unload(self) -> None:
        """Cancel listeners and timers."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        self._cancel_timers()

    def register_entity(self, key: str, entity: Any) -> None:
        """Called by platform entities after they are added."""
        self.entities[key] = entity

    def get_entity_id(self, key: str) -> str | None:
        ent = self.entities.get(key)
        if ent and hasattr(ent, "entity_id"):
            return ent.entity_id
        return None

    @property
    def auto_mode_available(self) -> bool:
        """Auto mode requires an adjacent-room humidity sensor in config."""
        return bool(self.room_humidity_entity)

    async def async_sync_auto_entity_visibility(self) -> None:
        """Enable/disable auto-related entities on the device page.

        When no room humidity sensor is configured, hide Auto / Delta /
        Min / Max / Recommended. When the sensor is present, re-enable them
        if they were disabled by this integration.
        """
        from homeassistant.helpers import entity_registry as er

        registry = er.async_get(self.hass)
        available = self.auto_mode_available

        for key in AUTO_MODE_KEYS:
            ent = self.entities.get(key)
            entity_id = getattr(ent, "entity_id", None) if ent else None
            if not entity_id:
                continue
            reg_entry = registry.async_get(entity_id)
            if reg_entry is None:
                continue

            if available:
                if reg_entry.disabled_by == er.RegistryEntryDisabler.INTEGRATION:
                    registry.async_update_entity(entity_id, disabled_by=None)
                    _LOGGER.debug("Enabled auto entity %s", entity_id)
            else:
                if reg_entry.disabled_by is None:
                    registry.async_update_entity(
                        entity_id,
                        disabled_by=er.RegistryEntryDisabler.INTEGRATION,
                    )
                    _LOGGER.debug("Disabled auto entity %s", entity_id)

        # Force auto off when mode is unavailable
        if not available:
            auto = self.entities.get(KEY_AUTO)
            if auto is not None and getattr(auto, "is_on", False):
                if hasattr(auto, "async_turn_off"):
                    await auto.async_turn_off()

    # ------------------------------------------------------------------
    # State helpers
    # ------------------------------------------------------------------

    def _is_humidifier_on(self) -> bool:
        state = self.hass.states.get(self.humidifier_entity)
        return (
            state is not None
            and state.state not in (STATE_OFF, "unavailable", "unknown", None)
        )

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

    def is_auto_on(self) -> bool:
        """Public: whether auto mode is available and switch is on."""
        if not self.auto_mode_available:
            return False
        ent_id = self.get_entity_id(KEY_AUTO)
        if not ent_id:
            return False
        state = self.hass.states.get(ent_id)
        return state is not None and state.state == STATE_ON

    def _read_humidity(self, entity_id: str | None) -> float | None:
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in ("unavailable", "unknown", None):
            return None
        try:
            return float(state.state)
        except (TypeError, ValueError):
            return None

    # ------------------------------------------------------------------
    # Core event handler
    # ------------------------------------------------------------------

    async def _async_state_changed(self, event: Event) -> None:
        entity_id = event.data.get("entity_id")
        new_state: State | None = event.data.get("new_state")
        old_state: State | None = event.data.get("old_state")

        if entity_id == self.humidifier_entity:
            if new_state and new_state.state == STATE_OFF:
                await self.async_full_stop()
            else:
                await self.async_update_fan()
                await self.async_sync_target_humidity()

        elif entity_id == self.fan_entity and self.fan_entity:
            if new_state and old_state:
                if new_state.state == STATE_ON and old_state.state != STATE_ON:
                    # Physical fan turned on → resume or start manual
                    if self._pause_active:
                        await self.async_manual_toggle()
                    elif (
                        not self.is_auto_on()
                        and not self._manual_active
                        and not self._pause_active
                    ):
                        await self.async_manual_toggle()
                elif new_state.state == STATE_OFF and old_state.state != STATE_OFF:
                    # Physical fan off while manual → go to pause
                    if self._manual_active:
                        await self.async_manual_toggle()

        if entity_id in (self.room_humidity_entity, self.bathroom_humidity_entity):
            rec = self.entities.get(KEY_RECOMMENDED)
            if rec and hasattr(rec, "async_write_ha_state"):
                rec.async_write_ha_state()
            if self.is_auto_on():
                await self.async_sync_target_humidity()

        await self.async_update_status_sensor()

    # ------------------------------------------------------------------
    # Public API (called by platforms / services)
    # ------------------------------------------------------------------

    async def async_full_stop(self) -> None:
        """Cancel timers, turn off auto and fan when dehumidifier is switched off."""
        self._cancel_timers()
        self._manual_active = False
        self._pause_active = False

        auto_id = self.get_entity_id(KEY_AUTO)
        if auto_id and self.is_auto_on():
            await self._safe_service_call(
                "switch", "turn_off", {ATTR_ENTITY_ID: auto_id}, blocking=True
            )

        if self.fan_entity:
            await self._safe_service_call(
                "switch", "turn_off", {ATTR_ENTITY_ID: self.fan_entity}, blocking=False
            )

        await self.async_update_status_sensor()

    async def async_sync_target_humidity(self) -> None:
        """Push recommended humidity to the physical humidifier when auto is on."""
        if not self.is_auto_on() or not self._is_humidifier_on():
            return

        recommended = self.compute_recommended_humidity()
        await self._safe_service_call(
            "humidifier",
            "set_humidity",
            {
                ATTR_ENTITY_ID: self.humidifier_entity,
                "humidity": int(recommended),
            },
            blocking=False,
        )

    async def async_update_fan(self) -> None:
        """Master fan controller — keeps fan state in sync with mode."""
        if not self.fan_entity:
            return

        if not self._is_humidifier_on() or self._pause_active:
            await self._safe_service_call(
                "switch", "turn_off", {ATTR_ENTITY_ID: self.fan_entity}, blocking=False
            )
            return

        if self._manual_active or self.is_auto_on():
            await self._safe_service_call(
                "switch", "turn_on", {ATTR_ENTITY_ID: self.fan_entity}, blocking=False
            )
        else:
            await self._safe_service_call(
                "switch", "turn_off", {ATTR_ENTITY_ID: self.fan_entity}, blocking=False
            )

    async def async_manual_toggle(self) -> None:
        """Toggle between idle → manual → pause → manual (cycle)."""
        if self._pause_active:
            self._cancel_pause()
            self._pause_active = False
            await self._start_manual_timer()
        elif self._manual_active:
            self._cancel_manual()
            self._manual_active = False
            await self._start_pause_timer()
        else:
            await self._start_manual_timer()

        await self.async_update_fan()
        await self.async_update_status_sensor()

    async def async_update_status_sensor(self) -> None:
        """Force status sensor refresh."""
        status_ent = self.entities.get(KEY_STATUS)
        if status_ent and hasattr(status_ent, "async_write_ha_state"):
            status_ent.async_write_ha_state()

    # ------------------------------------------------------------------
    # Timers
    # ------------------------------------------------------------------

    def _cancel_timers(self) -> None:
        self._cancel_manual()
        self._cancel_pause()

    def _cancel_manual(self) -> None:
        if self._manual_cancel:
            self._manual_cancel()
            self._manual_cancel = None

    def _cancel_pause(self) -> None:
        if self._pause_cancel:
            self._pause_cancel()
            self._pause_cancel = None

    async def _start_manual_timer(self) -> None:
        runtime_min = self._get_number(KEY_MANUAL_RUNTIME, DEFAULT_MANUAL_RUNTIME)
        self._manual_active = True
        self._pause_active = False

        def _expired(_now):
            self.hass.async_create_task(self._on_manual_expired())

        self._cancel_manual()
        self._manual_cancel = async_call_later(
            self.hass, timedelta(minutes=runtime_min), _expired
        )

    async def _start_pause_timer(self) -> None:
        runtime_min = self._get_number(KEY_PAUSE_RUNTIME, DEFAULT_PAUSE_RUNTIME)
        self._pause_active = True
        self._manual_active = False

        def _expired(_now):
            self.hass.async_create_task(self._on_pause_expired())

        self._cancel_pause()
        self._pause_cancel = async_call_later(
            self.hass, timedelta(minutes=runtime_min), _expired
        )

    async def _on_manual_expired(self) -> None:
        self._manual_active = False
        self._manual_cancel = None
        await self.async_update_fan()
        await self.async_update_status_sensor()

    async def _on_pause_expired(self) -> None:
        self._pause_active = False
        self._pause_cancel = None
        await self.async_update_fan()
        await self.async_update_status_sensor()

    # ------------------------------------------------------------------
    # Recommended humidity algorithm
    # ------------------------------------------------------------------

    def compute_recommended_humidity(self) -> int:
        """Recommended target only when auto mode is available.

        Auto: target = room_rh + delta, clamped to [min_rh, max_rh].
        Without room sensor auto is unavailable — returns humidifier target
        or a neutral midpoint (UI should not rely on this).
        """
        min_rh = self._get_number(KEY_MIN_RH, DEFAULT_MIN_RH)
        max_rh = self._get_number(KEY_MAX_RH, DEFAULT_MAX_RH)
        delta = self._get_number(KEY_DELTA, DEFAULT_DELTA)

        if max_rh < min_rh:
            min_rh, max_rh = max_rh, min_rh

        if not self.auto_mode_available:
            # Local mode: no auto target calculation
            state = self.hass.states.get(self.humidifier_entity)
            if state is not None:
                try:
                    th = state.attributes.get("target_humidity")
                    if th is not None:
                        return int(round(float(th)))
                except (TypeError, ValueError):
                    pass
            return int(round((min_rh + max_rh) / 2))

        room = self._read_humidity(self.room_humidity_entity)
        if room is not None:
            target = room + delta
        else:
            # Sensor configured but unavailable — hold midpoint until data returns
            target = (min_rh + max_rh) / 2

        return int(round(max(min_rh, min(max_rh, target))))

    def recommended_attributes(self) -> dict[str, Any]:
        return {
            ATTR_ROOM_HUMIDITY: self._read_humidity(self.room_humidity_entity),
            ATTR_BATHROOM_HUMIDITY: self._read_humidity(self.bathroom_humidity_entity),
            ATTR_DELTA: self._get_number(KEY_DELTA, DEFAULT_DELTA),
            ATTR_MIN_RH: self._get_number(KEY_MIN_RH, DEFAULT_MIN_RH),
            ATTR_MAX_RH: self._get_number(KEY_MAX_RH, DEFAULT_MAX_RH),
            ATTR_MODE: "room+delta" if self.auto_mode_available else "local",
            "auto_available": self.auto_mode_available,
        }

    def get_status(self) -> str:
        if not self._is_humidifier_on():
            return STATUS_OFF
        if self._pause_active:
            return STATUS_PAUSED
        if self._manual_active:
            return STATUS_MANUAL
        if self.is_auto_on():
            return STATUS_AUTO
        return STATUS_ON

    def get_status_label(self) -> str:
        return STATUS_LABELS.get(self.get_status(), "On")

    def get_status_attributes(self) -> dict[str, Any]:
        """Expose linked entities so the Lovelace card needs no manual entity config."""
        return {
            ATTR_LABEL: self.get_status_label(),
            ATTR_MANUAL_ACTIVE: self._manual_active,
            ATTR_PAUSE_ACTIVE: self._pause_active,
            "auto_available": self.auto_mode_available,
            "humidifier_entity": self.humidifier_entity,
            "fan_entity": self.fan_entity,
            "bathroom_humidity_entity": self.bathroom_humidity_entity,
            "room_humidity_entity": self.room_humidity_entity,
            "delta_entity": self.get_entity_id(KEY_DELTA),
            "min_rh_entity": self.get_entity_id(KEY_MIN_RH),
            "max_rh_entity": self.get_entity_id(KEY_MAX_RH),
            "auto_entity": self.get_entity_id(KEY_AUTO),
            "recommended_entity": self.get_entity_id(KEY_RECOMMENDED),
            "manual_runtime_entity": self.get_entity_id(KEY_MANUAL_RUNTIME),
            "pause_runtime_entity": self.get_entity_id(KEY_PAUSE_RUNTIME),
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    async def _safe_service_call(
        self,
        domain: str,
        service: str,
        data: dict,
        *,
        blocking: bool = False,
    ) -> None:
        """Call a service and log errors without crashing the coordinator."""
        try:
            await self.hass.services.async_call(
                domain, service, data, blocking=blocking
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning(
                "Service %s.%s failed for %s: %s",
                domain,
                service,
                data.get(ATTR_ENTITY_ID),
                err,
            )
