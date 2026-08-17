# Smart Dehumidifier

Версія **1.3.3**

## Чому раніше треба було додавати ресурс вручну?

Home Assistant **окремо** тримає:
1. **Інтеграції** (backend, entity) — ставляться через HACS Integration
2. **Lovelace-картки** (frontend JS) — мають бути в Resources

HACS при категорії Integration **не** додає JS-картку в Resources автоматично. Тому інтеграція сама:
- віддає файли по URL
- **копіює** картку в `/config/www/smart_dehumidifier/`
- **сама додає** ресурс у Lovelace (storage mode)

## Встановлення

1. HACS → Custom repositories → `https://github.com/kdinya/Smart-Dehumidifier`
2. Category: **Integration**
3. Download → **перезавантаж Home Assistant**
4. Settings → Devices & services → Add Integration → **Smart Dehumidifier**
5. Ще раз **перезавантаж HA** (щоб ресурс і `/local/` підхопились)
6. У браузері **Ctrl+F5**

Картка має підключитись **сама**.

### Якщо все ж «Custom element not found»

Перевір у браузері (має відкритись JS):

```
http://IP:8123/local/smart_dehumidifier/index.js
```

або

```
http://IP:8123/smart_dehumidifier_static/index.js
```

Якщо 404 на обох — інтеграція не завантажилась. Дивись логи.

Якщо JS відкривається, додай ресурс один раз:

**Settings → Dashboards → Resources**

```
URL:  /local/smart_dehumidifier/index.js
Type: JavaScript Module
```

Потім Ctrl+F5.

## Картка

```yaml
type: custom:smart-dehumidifier
entity: humidifier.bathroom
fan_entity: switch.bathroom_fan
```

Інші entity — у візуальному редакторі.

## Ліцензія

MIT
