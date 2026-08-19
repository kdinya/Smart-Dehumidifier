# Changelog

## 2.0.1 — 2026-08-19

### Fixed package release
- Release from Smart-Dehumidifier-fixed (1) archive

## 1.8.1 — 2026-08-18

### Fix
- **Options flow crash on HA 2025.12+ / 2026.x** — removed deprecated `self.config_entry = config_entry` assignment.
  `OptionsFlow.config_entry` is now a read-only property injected by Home Assistant.
  Fixes 500 Internal Server Error when opening device options / reconfigure.
- Align version across `manifest.json`, `const.py` and documentation.
- `hacs.json` minimum Home Assistant version set to 2024.12.0 (options-flow API change).

## 1.8.0

- Production-ready packaging and frontend registration improvements.

## 1.7.0 — 2026-08-18

### Auto mode only with room humidity sensor
- **Є** `room_humidity` → Auto, Delta, Min/Max RH, Recommended
- **Немає** room humidity → авто немає; ціль вручну + гістерезис осушувача
- На **сторінці пристрою** auto-entity приховуються/показуються автоматично
- Шестерня і панель авто на картці — лише коли авто доступне

## 1.6.6 — 2026-08-18

### Fix
- Visual card editor form was empty: restored missing `_tt` / `_sectionTitle` (i18n helpers)
- All accordion tabs still collapsed by default; headers visible again

## 1.6.5 — 2026-08-18

### Defaults
- Delta **3**, Min RH **65**, Max RH **85**, timers **20** хв
