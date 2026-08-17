# Smart Dehumidifier

**v1.4.0**

## Що змінилось

- Повзунки в шестерні працюють з `number.*` (не тільки input_number)
- Налаштування на сторінці пристрою — у категорії **Configuration** (не основні контроли)
- Нема секції «Автопанель» у візуальному редакторі картки
- `arc_radius` за замовчуванням **150**
- Мови **uk / ru / en** (по мові Home Assistant)
- Автовологість: **кімната + дельта**, з обмеженням min/max  
  (ванна = місце осушувача/вентилятора, кімната = орієнтир для розрахунку)
- Вентилятор = звичайний через smart switch

## Встановлення

1. HACS → Integration → оновити **1.4.0** → restart HA  
2. Resource: `/smart_dehumidifier_files/index.js` (JavaScript Module)  
3. Config flow: humidifier, fan switch, **bathroom humidity**, **room humidity**

## Картка

```yaml
type: custom:smart-dehumidifier
entity: humidifier.bathroom
fan_entity: switch.bathroom_fan
```

Entity з інтеграції обери в 🔌 Сутності (status, auto switch, numbers, button).

## Формула авто

```
target = clamp(room_humidity + delta, min_rh, max_rh)
```

Якщо сенсора кімнати немає — середина min/max (або логіка по ванній).

## Ліцензія

MIT
