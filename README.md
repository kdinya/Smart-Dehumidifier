# Smart Dehumidifier

Версія **1.3.5**

## Структура репозиторію (нормальна)

```
Smart-Dehumidifier/
├── custom_components/
│   └── smart_dehumidifier/          ← інтеграція
│       ├── __init__.py
│       ├── manifest.json
│       ├── config_flow.py
│       ├── sensor.py / switch.py / number.py / button.py
│       ├── frontend.py              ← копіює картку + реєструє ресурс
│       └── www/                     ← JS-картка (джерело)
│           ├── index.js             ← точка входу
│           ├── dehumidifier-card.js
│           ├── dehumidifier-editor.js
│           ├── components/
│           ├── files/
│           └── fonts/
├── package/                         ← опційний YAML (не потрібен)
├── hacs.json
├── README.md
└── LICENSE
```

Після старту HA картка копіюється сюди:

```
/config/www/smart_dehumidifier/index.js
```

Браузер завантажує **тільки URL** (не шлях файлу):

```
/local/smart_dehumidifier/index.js
```

## Встановлення

1. HACS → Custom repositories → `https://github.com/kdinya/Smart-Dehumidifier`
2. Category: **Integration**
3. Download → **повний restart** Home Assistant
4. Settings → Devices & services → Add Integration → **Smart Dehumidifier**
5. Ще один restart → **Ctrl+F5** у браузері

### Ресурс картки (має додатись сам)

Якщо ні — **Settings → Dashboards → Resources → Add**:

| Поле | Значення |
|------|----------|
| URL | `/local/smart_dehumidifier/index.js` |
| Type | **JavaScript Module** |

**Ніколи** не вказуй шлях типу  
`homeassistant/custom_components/...` або `/config/custom_components/...` — браузер цього не відкриє.

### Перевірка

Відкрий:

```
http://IP:8123/local/smart_dehumidifier/index.js
```

Має показати JavaScript. Якщо 404 — зроби restart ще раз і перевір, що інтеграція завантажена (логи).

## Картка

```yaml
type: custom:smart-dehumidifier
entity: humidifier.bathroom
fan_entity: switch.bathroom_fan
```

Інші entity — у візуальному редакторі (🔌 Сутності).

## Ліцензія

MIT
