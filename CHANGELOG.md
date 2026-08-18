# Changelog

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
- Мова за замовчуванням **українська**

### Form / Gear
- Усі вкладки форми вводу **згорнуті** за замовчуванням
- Стабільніше відкриття шестерні (overflow / requestUpdate)
- Безпечний resolve entity (помилки не валять UI)

## 1.6.4 — 2026-08-18

### Gear (шестерня)
- Слайдери замінені на **+ / −** (без range)
- Мова синхронізується з формою вводу (localStorage + config)

### Sync
- number.* (delta / min / max / runtime) надійніше авто-підтягуються (`smart_dehumidifier_*`)
- Зміни на сторінці пристрою і в шестерні одразу читаються карткою

### Form (форма вводу)
- **Вирівнювання осушувача** (ліворуч / центр / праворуч) виправлено
- Заголовки секцій і alignment перекладаються за мовою з шестерні

### Debug
- Логи: у консолі браузера `window.__SD_LOGS__` або `copy(window.__SD_LOGS__)`

## 1.6.3 — 2026-08-18

### Card editor
- **Автоматична вологість** — лише дизайн/розміщення Auto-панелі (не delta/min/max/таймери)
- Delta / min / max / timers лише на сторінці пристрою та в шестерні

### Integration
- Узгоджені межі number-сутностей: delta 0–20, min RH 20–90, max RH 30–99, timers 1–240 хв

### UX
- Слайдери в шестерні та редакторі: значення змінюється **тільки при горизонтальному** жесті (вертикальний скрол більше не стрибає)
- Helper entity (delta/auto/status…) **авто-підтягуються** з пристрою інтеграції без ручного вибору в картці

## 1.6.2 — 2026-08-18

### Card editor (Edit panel)
- All accordion sections **collapsed by default** (including Entities)
- New section **Автоматична вологість**: delta / min / max / recommended / auto switch / timers / status / manual toggle entity pickers

## 1.6.1 — 2026-08-18

### UI
- Settings (gear) modal: vertical scroll / drag works on mobile and desktop
- Card editor sections collapsed by default
- Explicit **Automatic humidity** section in gear settings (delta / min / max / recommended)

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
