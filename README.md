# Smart Dehumidifier

**Повністю незалежна** кастомна інтеграція + красива картка для Home Assistant.

При встановленні **все створюється автоматично** — більше не потрібно копіювати `package/*.yaml`.

Версія **1.3.0**

## Що отримуєш

- Інтеграція з Config Flow (UI)
- Автоматичне створення:
  - `switch.*_auto_humidity` — Авто режим
  - `number.*_delta`, `*_min_rh`, `*_max_rh`, `*_manual_runtime`, `*_pause_runtime`
  - `sensor.*_status`, `sensor.*_recommended_humidity`
  - `button.*_manual_toggle`
- Уся логіка всередині інтеграції (Full Stop, Master Fan, Auto Sync, Manual/Pause)
- Красива картка `custom:smart-dehumidifier` з візуальним редактором

## Встановлення (HACS)

1. HACS → ⋮ → **Custom repositories**
2. URL: `https://github.com/kdinya/Smart-Dehumidifier`
3. Category: **Integration**
4. Download / Install
5. **Перезавантаж Home Assistant**
6. Settings → Devices & services → **Add Integration** → знайди **Smart Dehumidifier**
7. Вибери свій `humidifier.*` і (опційно) вентилятор
8. Готово — всі entity з’являться самі

### Картка (Frontend)

Після встановлення інтеграції картка також доступна.

Додай ресурс (якщо HACS не додав):

```yaml
url: /hacsfiles/Smart-Dehumidifier/index.js
type: module
```

Або в HACS додатково додай цей самий репозиторій як **Lovelace / Dashboard**.

Тип картки:

```yaml
type: custom:smart-dehumidifier
```

У візуальному редакторі в блоці **🔌 Сутності** обери entity, які створила інтеграція (вони будуть з унікальними id на основі entry).

## Приклад мінімальної картки

```yaml
type: custom:smart-dehumidifier
entity: humidifier.bathroom
fan_entity: switch.bathroom_fan
status_entity: sensor.smart_dehumidifier_xxxxxxxx_status
auto_entity: switch.smart_dehumidifier_xxxxxxxx_auto_humidity
calc_entity: sensor.smart_dehumidifier_xxxxxxxx_recommended_humidity
manual_script_entity: button.smart_dehumidifier_xxxxxxxx_manual_toggle
delta_entity: number.smart_dehumidifier_xxxxxxxx_delta
min_rh_entity: number.smart_dehumidifier_xxxxxxxx_min_rh
max_rh_entity: number.smart_dehumidifier_xxxxxxxx_max_rh
manual_runtime_entity: number.smart_dehumidifier_xxxxxxxx_manual_runtime
manual_pause_runtime_entity: number.smart_dehumidifier_xxxxxxxx_pause_runtime
```

(точні entity_id дивись у Settings → Devices після додавання інтеграції)

## Функціонал

| Функція | Як працює |
|---------|-----------|
| Auto режим | Switch → синхронізує target humidity |
| Ручний режим | Button або сервіс `smart_dehumidifier.manual_toggle` |
| Пауза | Повторне натискання під час ручного режиму |
| Фізичний вентилятор | ON/OFF реагує і запускає/ставить на паузу |
| Full Stop | При вимкненні осушувача все скидається |
| Master Fan | Вентилятор керується логікою автоматично |

## Старий package

Файл `package/smart_dehumidifier.yaml` залишено для тих, хто хоче YAML-варіант.  
Але **рекомендований і автоматичний шлях** — тільки інтеграція.

## Структура

```
custom_components/smart_dehumidifier/   ← інтеграція (автоматично)
├── __init__.py
├── config_flow.py
├── sensor.py / switch.py / number.py / button.py
├── manifest.json
└── ...

index.js + dehumidifier-*.js + components/  ← картка
package/                                    ← старий YAML (опційно)
```

## Ліцензія

MIT
