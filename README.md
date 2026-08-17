# Smart Dehumidifier

Версія **1.3.2**

## Встановлення

### 1. Інтеграція

1. HACS → Custom repositories → `https://github.com/kdinya/Smart-Dehumidifier`
2. Category: **Integration**
3. Download → **перезавантаж Home Assistant**
4. Settings → Devices & services → Add Integration → **Smart Dehumidifier**

### 2. Картка (ресурс)

**Правильний URL:**

```
/smart_dehumidifier_static/index.js
```

**НЕ** використовуй `hacsfiles/...` — це тільки якщо встановлюєш як Lovelace.

#### Як додати ресурс

Settings → Dashboards → ⋮ → **Resources** → Add resource:

| Поле | Значення |
|------|----------|
| URL | `/smart_dehumidifier_static/index.js` |
| Type | **JavaScript Module** |

Потім **Ctrl+F5**.

З версії 1.3.2 інтеграція намагається додати ресурс автоматично (якщо Lovelace у режимі storage). Якщо ні — додай вручну як вище.

### Альтернатива

Додай **той самий** репозиторій у HACS ще раз як **Lovelace**, тоді:

```
/hacsfiles/Smart-Dehumidifier/index.js
```

## Картка

```yaml
type: custom:smart-dehumidifier
entity: humidifier.bathroom
fan_entity: switch.bathroom_fan
```

Інші entity — у візуальному редакторі (🔌 Сутності).

## Помилка «Custom element not found»

1. Переконайся, що ресурс саме `/smart_dehumidifier_static/index.js` і type = **module**
2. Перезавантаж HA після оновлення інтеграції
3. Ctrl+F5 у браузері
4. Відкрий у новій вкладці: `http://ТВІЙ_HA:8123/smart_dehumidifier_static/index.js`  
   Має показати JS-код. Якщо 404 — інтеграція не зареєструвала шлях (перевір логи).

## Ліцензія

MIT
