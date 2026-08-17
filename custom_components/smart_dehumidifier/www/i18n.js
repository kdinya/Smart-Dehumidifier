const STRINGS = {
  uk: {
    auto: 'Авто',
    manual: 'Ручний',
    pause: 'Пауза',
    off: 'Вимкнено',
    on: 'Увімкнено',
    settings: 'Налаштування',
    timers: 'Таймери',
    language: 'Мова',
    auto_panel: 'Автопанель',
    offset_x: 'Зміщення по X',
    offset_y: 'Зміщення по Y',
    arc: 'Дуга',
    arc_radius: 'Радіус дуги',
    delta: 'Дельта (до кімнати)',
    min_rh: 'Мін. ціль %',
    max_rh: 'Макс. ціль %',
    recommended: 'Рекомендовано',
    runtime: 'Ручний режим',
    pause_time: 'Пауза',
    min: 'хв',
    room_hint: 'Авто: кімната + дельта',
    bath_hint: 'Авто: лише ванна',
    beta: 'Бета — ще налаштовується',
  },
  ru: {
    auto: 'Авто',
    manual: 'Ручной',
    pause: 'Пауза',
    off: 'Выключено',
    on: 'Включено',
    settings: 'Настройки',
    timers: 'Таймеры',
    language: 'Язык',
    auto_panel: 'Автопанель',
    offset_x: 'Смещение по X',
    offset_y: 'Смещение по Y',
    arc: 'Дуга',
    arc_radius: 'Радиус дуги',
    delta: 'Дельта (к комнате)',
    min_rh: 'Мин. цель %',
    max_rh: 'Макс. цель %',
    recommended: 'Рекомендуется',
    runtime: 'Ручной режим',
    pause_time: 'Пауза',
    min: 'мин',
    room_hint: 'Авто: комната + дельта',
    bath_hint: 'Авто: только ванная',
    beta: 'Бета — ещё настраивается',
  },
  en: {
    auto: 'Auto',
    manual: 'Manual',
    pause: 'Pause',
    off: 'Off',
    on: 'On',
    settings: 'Settings',
    timers: 'Timers',
    language: 'Language',
    auto_panel: 'Auto panel',
    offset_x: 'Offset X',
    offset_y: 'Offset Y',
    arc: 'Arc',
    arc_radius: 'Arc radius',
    delta: 'Delta (vs room)',
    min_rh: 'Min target %',
    max_rh: 'Max target %',
    recommended: 'Recommended',
    runtime: 'Manual mode',
    pause_time: 'Pause',
    min: 'min',
    room_hint: 'Auto: room + delta',
    bath_hint: 'Auto: bathroom only',
    beta: 'Beta — still being tuned',
  },
};

export function getLang(hass, config) {
  const forced = (config && (config.language || config.lang)) || null;
  if (forced && STRINGS[forced]) return forced;
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

export function t(hass, key, config) {
  const lang = getLang(hass, config);
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
}
