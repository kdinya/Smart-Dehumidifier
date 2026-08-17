# Smart Dehumidifier

**Повністю незалежний** проєкт для Home Assistant.  
Не залежить від жодних старих карток (`my-dehumidifier`, локальних zip, `vanna_*` тощо).

Версія **1.2.0**

Окремий репозиторій з власним типом картки, власними custom elements і власним пакетом helpers/автоматизацій.

## Тип картки

```yaml
type: custom:smart-dehumidifier
```

Custom elements:
- `smart-dehumidifier` — основна картка
- `smart-dehumidifier-editor` — візуальний редактор

## Встановлення через HACS (рекомендовано)

1. Відкрий **HACS**
2. Натисни **⋮** (вгорі справа) → **Custom repositories**
3. Встав URL: `https://github.com/kdinya/Smart-Dehumidifier`
4. **Category обов’язково: Lovelace** (не Integration!)
5. Натисни **Add**
6. Знайди **Smart Dehumidifier** у Frontend і натисни **Download**
7. Перезавантаж браузер (Ctrl + F5 / Cmd + Shift + R)

Ресурс (якщо HACS не додав автоматично):

```yaml
url: /hacsfiles/Smart-Dehumidifier/index.js
type: module
```

> Старий осушувач / стару картку **не чіпай і не видаляй**.  
> Ця картка має інший `type` і інші custom elements — конфліктів не буде.

## Швидкий старт

### 1. Backend (Package)

1. Скопіюй файл `package/smart_dehumidifier.yaml`
2. Заміни **два** плейсхолдери на свої реальні entity:
   - `YOUR_HUMIDIFIER_ENTITY` → наприклад `bathroom` (без `humidifier.`)
   - `YOUR_FAN_ENTITY` → наприклад `bathroom_fan` (без `switch.`)
3. Додай пакет у `configuration.yaml`:

```yaml
homeassistant:
  packages:
    smart_dehumidifier: !include package/smart_dehumidifier.yaml
```

або поклади файл у `packages/` і увімкни packages.

4. Перезавантаж Home Assistant (Configuration → YAML configuration reloading → Packages або повний restart).

Після цього з’являться:
- `input_boolean.sd_auto_humidity`
- `input_number.sd_*`
- `timer.sd_manual_mode` / `timer.sd_manual_pause`
- `sensor.sd_status` / `sensor.sd_recommended_humidity` / `sensor.sd_status_label`
- `script.sd_manual_toggle`
- 5 автоматизацій з префіксом `SD -`

### 2. Картка

1. Додай нову картку → **Custom: Smart Dehumidifier**
2. У блоці **🔌 Сутності** обери (або впиши):
   - Основний осушувач (`humidifier.*`)
   - Вентилятор (`switch.*`)
   - Статус → `sensor.sd_status`
   - Авто → `input_boolean.sd_auto_humidity`
   - Рекомендована вологість → `sensor.sd_recommended_humidity`
   - Скрипт → `script.sd_manual_toggle`
   - Дельта / мін / макс / час ручного / час паузи → відповідні `input_number.sd_*`
3. Решту налаштувань (розкладка, дуга, ефекти, шрифти) — у секціях нижче. Все візуально.

Мінімальний робочий приклад:

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

## Функціонал (весь, як у старому)

- Автоматична синхронізація цільової вологості
- Ручний режим з таймером + пауза
- Реакція на фізичне вмикання/вимикання вентилятора
- Master Fan Controller (вентилятор керується логікою, а не руками)
- Full Stop при вимкненні осушувача
- Статус (off / auto / manual / paused)
- Повністю налаштовувана візуальна картка (скло, дуга, повзунок, ефекти тощо)

## Структура репозиторію

```
Smart-Dehumidifier/
├── index.js                    # точка входу
├── dehumidifier-card.js
├── dehumidifier-editor.js
├── visual-editor-config.js
├── dh-utils.js
├── components/                 # UI-блоки
├── files/                      # Lit (офлайн, без CDN)
├── fonts/                      # 7-segment
├── package/
│   └── smart_dehumidifier.yaml # helpers + automations
├── hacs.json
├── README.md
└── LICENSE
```

## Важливо

- Репозиторій **повністю самостійний**.
- Не використовує жодних entity зі старого проєкту.
- Можна ставити паралельно зі старим осушувачем.
- Оновлення через HACS.

## Ліцензія

MIT
