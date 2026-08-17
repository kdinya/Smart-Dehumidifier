# Smart Dehumidifier

**Premium visual card + smart logic package for Home Assistant**

Версія **1.0.0**

## Встановлення (HACS)

1. HACS → Frontend → ⋮ → **Custom repositories**
2. URL: `https://github.com/kdinya/Smart-Dehumidifier`
3. Category: **Lovelace**
4. Встановити

Ресурс (якщо потрібно):
```yaml
url: /hacsfiles/Smart-Dehumidifier/index.js
type: module
```

## Налаштування

1. Додай картку **Smart Dehumidifier** / `custom:my-dehumidifier`
2. Відкрий **візуальний редактор**
3. У секції **🔌 Сутності (Entities)** вибери свої entity через зручний entity-picker
4. Решту (розміри, ефекти, кнопки…) налаштуй слайдерами

## Backend (Package)

Файл `package/smart_dehumidifier.yaml` — створи helpers + автоматизації.

Заміни:
- `YOUR_HUMIDIFIER_ENTITY`
- `YOUR_FAN_ENTITY`

і (опційно) префікс `sd_`.

## Ліцензія

MIT
