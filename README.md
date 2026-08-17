# Smart Dehumidifier

**Повністю незалежна** кастомна інтеграція + красива картка для Home Assistant.

Версія **1.3.1**

При встановленні **helpers створюються автоматично**. Картку потрібно один раз підключити як ресурс.

## Встановлення

### 1. Інтеграція (HACS)

1. HACS → ⋮ → **Custom repositories**
2. URL: `https://github.com/kdinya/Smart-Dehumidifier`
3. Category: **Integration**
4. Download → **перезавантаж Home Assistant**
5. Settings → Devices & services → **Add Integration** → **Smart Dehumidifier**
6. Вибери `humidifier` і (опційно) вентилятор

### 2. Картка (обов’язково)

Після перезавантаження додай ресурс:

**Settings → Dashboards → ⋮ (три крапки вгорі) → Resources → Add resource**

```
URL:  /smart_dehumidifier_static/index.js
Type: JavaScript Module
```

Або YAML:

```yaml
url: /smart_dehumidifier_static/index.js
type: module
```

Потім **Ctrl+F5** у браузері.

### Альтернатива (через HACS Lovelace)

Додай **той самий** репозиторій ще раз як **Lovelace / Dashboard**, тоді ресурс буде:

```
/hacsfiles/Smart-Dehumidifier/index.js
```

## Картка

```yaml
type: custom:smart-dehumidifier
entity: humidifier.bathroom
fan_entity: switch.bathroom_fan
status_entity: sensor.XXXX_status
auto_entity: switch.XXXX_auto_humidity
calc_entity: sensor.XXXX_recommended_humidity
manual_script_entity: button.XXXX_manual_toggle
delta_entity: number.XXXX_delta
min_rh_entity: number.XXXX_min_rh
max_rh_entity: number.XXXX_max_rh
manual_runtime_entity: number.XXXX_manual_runtime
manual_pause_runtime_entity: number.XXXX_pause_runtime
```

Точні entity_id дивись у **Settings → Devices → Smart Dehumidifier**.

У візуальному редакторі є блок **🔌 Сутності** з picker’ами.

## Що створює інтеграція

| Entity | Призначення |
|--------|-------------|
| `switch.*_auto_humidity` | Авто режим |
| `number.*_delta` | Дельта |
| `number.*_min_rh` / `*_max_rh` | Межі авто |
| `number.*_manual_runtime` / `*_pause_runtime` | Час ручного / паузи |
| `sensor.*_status` | Статус (off/auto/manual/paused) |
| `sensor.*_recommended_humidity` | Рекомендована вологість |
| `button.*_manual_toggle` | Ручний режим / пауза |

## Помилка «Custom element doesn't exist»

Означає, що ресурс картки не підключений. Зроби крок **2** вище і онови сторінку (Ctrl+F5).

## Ліцензія

MIT
