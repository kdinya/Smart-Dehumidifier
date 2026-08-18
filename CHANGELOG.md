# Changelog

## 1.6.0 — 2026-08-18

### Breaking / Major improvements
- **State persistence**: Auto switch and all Number entities now restore their last value after Home Assistant restart (`RestoreEntity` / `RestoreNumber`).
- **Architecture**: Extracted full logic into dedicated `coordinator.py`. Platforms only call public methods.
- **Config Flow validation**: Entities are checked for existence before creating the entry. Clear error messages for missing entities.
- **Public API**: `async_sync_target_humidity`, `async_update_fan`, `async_manual_toggle`, `async_full_stop`, `is_auto_on`, etc. are now public and safe.
- **Error handling**: Service calls (humidifier, switch) are wrapped — failures log a warning instead of crashing the coordinator.
- **i18n**: Status labels are English keys; frontend `i18n.js` already translates them (uk/ru/en).
- **Service**: `smart_dehumidifier.manual_toggle` now has a proper schema and can target a specific `entry_id` or all instances.
- **Logging**: Frontend resource registration uses `info`/`debug` instead of `warning` for normal operations.
- **iot_class**: Changed to `local_push` (event-driven).

### Tests
- Added `pytest` suite with `pytest-homeassistant-custom-component`.
- Coverage for coordinator (recommended humidity, status transitions, manual cycle, unavailable sensors) and config flow validation.
- GitHub Actions workflow runs tests on every push/PR.

### Other
- Version consistency across `manifest.json`, `const.py`, README.
- Improved `.gitignore`, added `pyproject.toml`, `CHANGELOG.md`.
- Cleaner entity registration and status attributes.

## 1.5.2
Previous stable release before the major refactor.
