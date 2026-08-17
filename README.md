# Smart Dehumidifier

Версія **1.3.6**

## Структура

```
/config/custom_components/smart_dehumidifier/     ← інтеграція (HACS)
/config/custom_components/smart_dehumidifier/www/  ← JS-картка на диску
```

Браузер **не** читає шлях на диску. Файли віддаються по HTTP:

```
/smart_dehumidifier_files/index.js
```

Копіювання в `/config/www` (**local**) більше не використовується.

## Встановлення

1. HACS → Integration → онови до **1.3.6**
2. **Повний restart** Home Assistant
3. Ctrl+F5

### Ресурс (якщо не додався сам)

Settings → Dashboards → Resources → Add:

| URL | Type |
|-----|------|
| `/smart_dehumidifier_files/index.js` | **JavaScript Module** |

### Перевірка

Відкрий у браузері:

```
http://IP:8123/smart_dehumidifier_files/index.js
```

Має бути JS-код. Якщо 404 — інтеграція не завантажилась (дивись логи `smart_dehumidifier`).

**Не використовуй** шляхи:
- `homeassistant/custom_components/...`
- `/config/custom_components/...`
- `/local/smart_dehumidifier/...` (більше не потрібно)

## Картка

```yaml
type: custom:smart-dehumidifier
entity: humidifier.bathroom
fan_entity: switch.bathroom_fan
```

## Ліцензія

MIT
