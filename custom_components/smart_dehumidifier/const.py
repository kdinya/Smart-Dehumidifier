"""Constants for Smart Dehumidifier."""

DOMAIN = "smart_dehumidifier"
VERSION = "1.5.0"

CONF_HUMIDIFIER = "humidifier_entity"
CONF_FAN = "fan_entity"
CONF_NAME = "name"
CONF_PREFIX = "prefix"
CONF_BATHROOM_HUMIDITY = "bathroom_humidity_entity"
CONF_ROOM_HUMIDITY = "room_humidity_entity"

DEFAULT_NAME = "Smart Dehumidifier"
DEFAULT_PREFIX = "sd"

DEFAULT_DELTA = 3.0
DEFAULT_MIN_RH = 45
DEFAULT_MAX_RH = 65
DEFAULT_MANUAL_RUNTIME = 20
DEFAULT_PAUSE_RUNTIME = 20

KEY_AUTO = "auto"
KEY_DELTA = "delta"
KEY_MIN_RH = "min_rh"
KEY_MAX_RH = "max_rh"
KEY_MANUAL_RUNTIME = "manual_runtime"
KEY_PAUSE_RUNTIME = "pause_runtime"
KEY_STATUS = "status"
KEY_RECOMMENDED = "recommended"
KEY_MANUAL_ACTIVE = "manual_active"
KEY_PAUSE_ACTIVE = "pause_active"
