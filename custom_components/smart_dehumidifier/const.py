"""Constants for Smart Dehumidifier."""

from __future__ import annotations

DOMAIN = "smart_dehumidifier"
VERSION = "1.8.3"

CONF_HUMIDIFIER = "humidifier_entity"
CONF_FAN = "fan_entity"
CONF_NAME = "name"
CONF_PREFIX = "prefix"
CONF_BATHROOM_HUMIDITY = "bathroom_humidity_entity"
CONF_ROOM_HUMIDITY = "room_humidity_entity"

DEFAULT_NAME = "Smart Dehumidifier"
DEFAULT_PREFIX = "sd"

DEFAULT_DELTA = 3.0
DEFAULT_MIN_RH = 65.0
DEFAULT_MAX_RH = 85.0
DEFAULT_MANUAL_RUNTIME = 20.0
DEFAULT_PAUSE_RUNTIME = 20.0

KEY_AUTO = "auto"
KEY_DELTA = "delta"
KEY_MIN_RH = "min_rh"
KEY_MAX_RH = "max_rh"
KEY_MANUAL_RUNTIME = "manual_runtime"
KEY_PAUSE_RUNTIME = "pause_runtime"
KEY_STATUS = "status"
KEY_RECOMMENDED = "recommended"
KEY_MANUAL_TOGGLE = "manual_toggle"

# Entities only relevant when room humidity sensor is configured (auto mode)
AUTO_MODE_KEYS = (
    KEY_AUTO,
    KEY_DELTA,
    KEY_MIN_RH,
    KEY_MAX_RH,
    KEY_RECOMMENDED,
)

ATTR_ROOM_HUMIDITY = "room_humidity"
ATTR_BATHROOM_HUMIDITY = "bathroom_humidity"
ATTR_DELTA = "delta"
ATTR_MIN_RH = "min_rh"
ATTR_MAX_RH = "max_rh"
ATTR_MODE = "mode"
ATTR_MANUAL_ACTIVE = "manual_active"
ATTR_PAUSE_ACTIVE = "pause_active"
ATTR_LABEL = "label"

STATUS_OFF = "off"
STATUS_PAUSED = "paused"
STATUS_MANUAL = "manual"
STATUS_AUTO = "auto"
STATUS_ON = "on"

STATUS_LABELS = {
    STATUS_OFF: "Off",
    STATUS_PAUSED: "Paused",
    STATUS_MANUAL: "Manual",
    STATUS_AUTO: "Auto",
    STATUS_ON: "On",
}
