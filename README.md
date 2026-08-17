# Smart Dehumidifier

Версія **1.3.4**

Кастомна інтеграція Home Assistant + Lovelace-картка.

## Структура репозиторію

```
Smart-Dehumidifier/
├── custom_components/
│   └── smart_dehumidifier/          ← інтеграція (HACS Integration)
│       ├── __init__.py
│       ├── config_flow.py
│       ├── frontend.py              ← реєстрація картки
│       ├── sensor.py / switch.py / number.py / button.py
│       ├── manifest.json
│       └── www/                     ← файли картки
│           ├── index.js             ← точка входу
│           ├── dehumidifier-card.js
│           ├── dehumidifier-editor.js
│           ├── components/
│           ├── files/
│           └── fonts/
├── package/                         ← опційний YAML (не обов’язково)
├── hacs.json
├── README.md
└── LICENSE
```

Після встановлення HACS кладе інтеграцію сюди:

```
/config/custom_components/smart_dehumidifier/
```

Картка також копіюється сюди (для `/local/`):

```
/config/www/smart_dehumidifier/index.js
```

## URL ресурсу картки

| URL | Звідки |
|-----|--------|
| `/local/smart_dehumidifier/index.js` | копія в `config/www/` (надійніше) |
| `/smart_dehumidifier_static/index.js` | напряму з `custom_components/.../www/` |

## Встановлення

1. HACS → Custom repositories → `https://github.com/kdinya/Smart-Dehumidifier`
2. Category: **Integration**
3. Download → **повний restart** Home Assistant
4. Settings → Devices & services → Add Integration → **Smart Dehumidifier**
5. Ctrl+F5 у браузері

### Якщо «Custom element not found»

1. Відкрий: `http://IP:8123/local/smart_dehumidifier/index.js` — має бути JS
2. Settings → Dashboards → Resources → Add:

```
URL:  /local/smart_dehumidifier/index.js
Type: JavaScript Module
```

3. Ctrl+F5

## Картка

```yaml
type: custom:smart-dehumidifier
entity: humidifier.bathroom
fan_entity: switch.bathroom_fan
```

## Ліцензія

MIT
