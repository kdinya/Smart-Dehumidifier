# Smart Dehumidifier

**Version 1.6.5** — production-ready custom integration for Home Assistant.

Intelligent control of a bathroom dehumidifier + optional fan, with automatic target humidity calculated from an adjacent room sensor.

## Features

- **Auto mode** — target humidity = room RH + delta, clamped to min/max
- **Manual / Pause timers** — physical fan button or Lovelace button cycles Idle → Manual → Pause
- **State restore** — Auto switch and all settings survive HA restarts
- **Beautiful Lovelace card** with arc slider, multi-language (UK / RU / EN)
- **HACS compatible**

## Installation (HACS)

1. HACS → Integrations → Custom repositories → add `https://github.com/kdinya/Smart-Dehumidifier`
2. Install **Smart Dehumidifier**
3. Restart Home Assistant
4. Settings → Devices & services → Add Integration → **Smart Dehumidifier**
5. Select:
   - Humidifier entity (required)
   - Fan switch / fan (optional)
   - Bathroom humidity sensor (optional)
   - Adjacent room humidity sensor (recommended for auto)
6. Add Lovelace resource (usually auto-registered):  
   `/smart_dehumidifier_files/index.js` (JavaScript Module)  
   Force refresh: Ctrl+F5

## Lovelace card

```yaml
type: custom:smart-dehumidifier
entity: humidifier.your_dehumidifier
fan_entity: switch.your_fan          # optional
language: uk                         # uk | ru | en
arc_radius: 150
```

All settings (delta, min/max RH, timers) are available via the gear icon on the card or as regular `number.*` entities.

## Auto humidity algorithm

```
target = clamp(room_humidity + delta, min_rh, max_rh)
```

- If room sensor is missing → uses bathroom or midpoint of min/max.
- Changes to delta / min / max or humidity sensors immediately update the recommended value and (when Auto is on) push it to the humidifier.

## Services

```yaml
service: smart_dehumidifier.manual_toggle
data:
  entry_id: "optional_config_entry_id"   # omit to toggle all
```

## Development & Tests

```bash
pip install -r tests/requirements_test.txt
pytest --cov=custom_components/smart_dehumidifier -q
```

## License

MIT
