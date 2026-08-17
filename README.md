# Smart Dehumidifier

> **BETA** — проєкт ще налаштовується. Структура й API можуть змінюватись.

Версія **1.4.1**

## Структура репозиторію (стандарт HACS Integration)

```
Smart-Dehumidifier/
├── custom_components/
│   └── smart_dehumidifier/
│       ├── __init__.py          # логіка + fan / auto / manual
│       ├── manifest.json
│       ├── config_flow.py       # UI: humidifier, fan, room + bathroom RH
│       ├── sensor.py / switch.py / number.py / button.py
│       ├── frontend.py          # HTTP: /smart_dehumidifier_files/
│       └── www/                 # Lovelace card
│           ├── index.js
│           ├── dehumidifier-card.js
│           ├── components/
│           └── i18n.js          # uk / ru / en
├── hacs.json
├── README.md
└── LICENSE
```

## Встановлення (бета)

1. HACS → **Integration** → `https://github.com/kdinya/Smart-Dehumidifier`
2. Restart Home Assistant
3. Settings → Devices & services → **Smart Dehumidifier**
4. Вкажи: humidifier, fan (smart switch), вологість **ванної**, вологість **кімнати**
5. Resource: `/smart_dehumidifier_files/index.js` (JavaScript Module)
6. Ctrl+F5

## Картка

Налаштування — **тільки в шестерні на картці** (не на сторінці пристрою):

- Дельта / min / max / таймери (повзунки → `number.*`)
- Автопанель: зміщення **X / Y**, радіус дуги (за замовч. **150**)
- Мова: **UK / RU / EN**

```yaml
type: custom:smart-dehumidifier
entity: humidifier.xxx
fan_entity: switch.xxx
language: uk
arc_radius: 150
```

## Автовологість

```
ціль = clamp(вологість_кімнати + дельта, min, max)
```

Осушувач і вентилятор у **ванні**; орієнтир — **сусідня кімната**.  
Якщо сенсора кімнати немає — інший розрахунок (ванна / середина діапазону).

## Ліцензія

MIT
