# Smart Dehumidifier

Окремий самостійний проєкт для Home Assistant.  
**Не залежить** від старих карток `my-dehumidifier` / локальних zip.

Версія **1.1.0**

## Тип картки

```yaml
type: custom:smart-dehumidifier
```

Custom elements:
- `smart-dehumidifier` — картка
- `smart-dehumidifier-editor` — візуальний редактор

## Встановлення (HACS)

1. HACS → Frontend → ⋮ → **Custom repositories**
2. URL: `https://github.com/kdinya/Smart-Dehumidifier`
3. Category: **Lovelace**
4. Download / Install
5. Перезавантаж браузер (Ctrl+F5)

Ресурс (якщо HACS не додав автоматично):

```yaml
url: /hacsfiles/Smart-Dehumidifier/index.js
type: module
```

> Старий dehumidifier **не чіпай**. Ця картка — інший type і інші elements.

## Налаштування

1. Додай картку **Smart Dehumidifier** (`custom:smart-dehumidifier`)
2. У блоці **🔌 Сутності** обери entity (picker або вручну)
3. Решту параметрів — у секціях нижче (розкладка, дуга, ефекти…)

Мінімальний приклад:

```yaml
type: custom:smart-dehumidifier
entity: humidifier.bathroom
fan_entity: switch.bathroom_fan
status_entity: sensor.sd_status
auto_entity: input_boolean.sd_auto_humidity
calc_entity: sensor.sd_recommended_humidity
manual_script_entity: script.sd_manual_toggle
delta_entity: input_number.sd_delta
min_rh_entity: input_number.sd_auto_min
max_rh_entity: input_number.sd_auto_max
manual_runtime_entity: input_number.sd_manual_runtime
manual_pause_runtime_entity: input_number.sd_manual_pause_runtime
```

## Backend (Package)

Файл `package/smart_dehumidifier.yaml` — helpers + автоматизації з префіксом `sd_`.

Заміни плейсхолдери:
- `YOUR_HUMIDIFIER_ENTITY`
- `YOUR_FAN_ENTITY`

## Структура (усе всередині репо)

- `index.js` — точка входу
- `dehumidifier-card.js` / `dehumidifier-editor.js`
- `components/` — UI-блоки
- `files/lit-core.min.js` — Lit офлайн (без CDN)
- `fonts/` — 7segment
- `package/` — HA package

## Ліцензія

MIT
