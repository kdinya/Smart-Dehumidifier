"""Constants for Smart Dehumidifier."""

DOMAIN = "smart_dehumidifier"
VERSION = "1.3.6"

CONF_HUMIDIFIER = "humidifier_entity"
CONF_FAN = "fan_entity"
CONF_NAME = "name"
CONF_PREFIX = "prefix"

DEFAULT_NAME = "Smart Dehumidifier"
DEFAULT_PREFIX = "sd"

# Number defaults
DEFAULT_DELTA = 3.0
DEFAULT_MIN_RH = 65
DEFAULT_MAX_RH = 85
DEFAULT_MANUAL_RUNTIME = 20
DEFAULT_PAUSE_RUNTIME = 20

# Entity keys (used as unique_id suffixes)
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
