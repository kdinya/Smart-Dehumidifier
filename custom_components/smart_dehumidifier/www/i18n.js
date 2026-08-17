const STRINGS = {
  uk: {
    auto: 'Авто',
    manual: 'Ручний',
    pause: 'Пауза',
    off: 'Вимкнено',
    on: 'Увімкнено',
    settings: 'Налаштування',
    timers: 'Таймери',
    delta: 'Дельта (до кімнати)',
    min_rh: 'Мін. ціль %',
    max_rh: 'Макс. ціль %',
    recommended: 'Рекомендовано',
    runtime: 'Ручний режим',
    pause_time: 'Пауза',
    min: 'хв',
    room_hint: 'Авто: кімната + дельта',
    bath_hint: 'Авто: лише ванна',
  },
  ru: {
    auto: 'Авто',
    manual: 'Ручной',
    pause: 'Пауза',
    off: 'Выключено',
    on: 'Включено',
    settings: 'Настройки',
    timers: 'Таймеры',
    delta: 'Дельта (к комнате)',
    min_rh: 'Мин. цель %',
    max_rh: 'Макс. цель %',
    recommended: 'Рекомендуется',
    runtime: 'Ручной режим',
    pause_time: 'Пауза',
    min: 'мин',
    room_hint: 'Авто: комната + дельта',
    bath_hint: 'Авто: только ванная',
  },
  en: {
    auto: 'Auto',
    manual: 'Manual',
    pause: 'Pause',
    off: 'Off',
    on: 'On',
    settings: 'Settings',
    timers: 'Timers',
    delta: 'Delta (vs room)',
    min_rh: 'Min target %',
    max_rh: 'Max target %',
    recommended: 'Recommended',
    runtime: 'Manual mode',
    pause_time: 'Pause',
    min: 'min',
    room_hint: 'Auto: room + delta',
    bath_hint: 'Auto: bathroom only',
  },
};

export function getLang(hass) {
  const raw =
    hass?.locale?.language ||
    hass?.language ||
    (typeof navigator !== 'undefined' ? navigator.language : 'en') ||
    'en';
  const code = String(raw).toLowerCase().slice(0, 2);
  if (code === 'uk' || code === 'ua') return 'uk';
  if (code === 'ru') return 'ru';
  return 'en';
}

export function t(hass, key) {
  const lang = getLang(hass);
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
}
