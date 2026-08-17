const field = (type, key, label, extra = {}) => ({ key, label, type, ...extra });
const txt = (key, label, def = '') => field('txt', key, label, { default: def });
const num = (key, label, min, max, def, step = 1) => field('num', key, label, { min, max, step, default: def });
const tog = (key, label, def = false) => field('tog', key, label, { default: def });
const sel = (key, label, def, options) => field('select', key, label, { default: def, options });
const ent = (key, label, domain = null, required = false) => field('entity', key, label, { domain, required, default: '' });
const section = (id, em, title, fields) => ({ id, em, title, fields });

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Ліворуч' },
  { value: 'center', label: 'По центру' },
  { value: 'right', label: 'Праворуч' },
];

export const ENTITY_FIELDS = [
  ent('entity', 'Основний осушувач', 'humidifier', true),
  ent('fan_entity', 'Вентилятор', 'switch'),
  ent('status_entity', 'Статус', 'sensor'),
  ent('auto_entity', 'Авто режим', 'switch'),
  ent('calc_entity', 'Рекомендована вологість', 'sensor'),
  ent('current_humidity_entity', 'Вологість у ванній', 'sensor'),
  ent('room_humidity_entity', 'Вологість у кімнаті (для авто)', 'sensor'),
  ent('manual_script_entity', 'Ручний режим (button/script)', null),
  ent('delta_entity', 'Дельта', 'number'),
  ent('min_rh_entity', 'Мін. вологість авто', 'number'),
  ent('max_rh_entity', 'Макс. вологість авто', 'number'),
  ent('manual_runtime_entity', 'Час ручного режиму', 'number'),
  ent('manual_pause_runtime_entity', 'Час паузи', 'number'),
];

export const EDITOR_SCHEMA = [
  section('entities', '🔌', 'Сутності (Entities)', ENTITY_FIELDS),

  section('layout', '📐', 'Розкладка', [
    num('card_border_radius', 'Заокруглення картки', 0, 80, 28, 1),
    num('card_height_percent', 'Висота картки на телефоні (%)', 30, 200, 100, 1),
    num('glass_max_width', 'Макс. ширина СКЛА (для ПК)', 200, 2000, 1000, 10),
    num('glass_aspect_ratio', 'Пропорція скла на ПК (Шир/Вис)', 1.0, 3.0, 1.8, 0.1),
    num('layout_base_width', 'Макс. ширина ПРИЛАДУ', 200, 1000, 400, 10),
    sel('alignment', 'Вирівнювання осушувача', 'center', ALIGNMENT_OPTIONS),
    num('content_padding_top', 'Відступ зверху', 0, 200, 40, 1),
    num('content_padding_bottom', 'Відступ знизу', 0, 200, 16, 1),
    num('content_padding_left', 'Відступ ліворуч', 0, 400, 14, 1),
    num('content_padding_right', 'Відступ праворуч', 0, 400, 14, 1),
    num('device_offset_x', 'Зсув приладу по X', -200, 200, 0, 1),
    num('device_offset_y', 'Зсув приладу по Y', -200, 200, 0, 1),
    num('controls_max_width', 'Макс. ширина нижніх блоків', 80, 900, 520, 1),
  ]),

  section('arc', '🔵', 'Дуга та повзунок', [
    tog('show_arc', 'Показати дугу', true),
    num('arc_start', 'Початок дуги', 0, 360, 225, 1),
    num('arc_span', 'Довжина дуги', 30, 360, 270, 1),
    num('arc_radius', 'Радіус дуги', 50, 500, 150, 1),
    num('arc_bg_width', 'Товщина фону', 1, 120, 30, 1),
    num('arc_cur_width', 'Товщина поточної', 1, 120, 30, 1),
    num('arc_tgt_width', 'Товщина цілі', 1, 120, 30, 1),
    tog('arc_glow', 'Світіння дуги', true),
    num('dot_radius', 'Радіус повзунка', 3, 80, 24, 1),
    num('dot_hit_radius', 'Зона дотику повзунка', 6, 120, 34, 1),
    tog('dot_glow', 'Світіння повзунка', true),
  ]),


  section('humidity', '💧', 'Поточна вологість', [
    tog('show_current', 'Показати вологість', true),
    num('cur_max_width', 'Макс. ширина тексту', 100, 600, 400, 10),
    txt('cur_font_family', 'Шрифт', 'inherit'),
    num('cur_size', 'Розмір цілої', 10, 220, 90, 1),
    num('cur_dec_size', 'Розмір десяткової', 10, 160, 60, 1),
    num('cur_unit_size', 'Розмір %', 8, 160, 50, 1),
    num('cur_font_weight', 'Жирність цифр', 100, 900, 500, 100),
    num('cur_unit_weight', 'Жирність %', 100, 900, 300, 100),
    tog('cur_show_decimal', 'Показувати десяткову', true),
    tog('cur_show_unit', 'Показувати %', true),
    num('cur_letter_spacing', 'Інтервал цифр', -20, 20, -2, 0.5),
    num('cur_gap', 'Відстань між числами', 0, 20, 3, 0.5),
    num('cur_unit_margin_left', 'Відступ %', -20, 40, 2, 0.5),
    num('cur_offset_y', 'Положення по вертикалі Y', -200, 200, 10, 1),
  ]),

  section('target', '🎯', 'Панель цільової вологості', [
    tog('show_hum_panel', 'Показати панель', true),
    num('hum_panel_width', 'Ширина панелі (%)', 120, 520, 240, 1),
    num('hum_panel_max_width', 'Макс. ширина панелі (px)', 120, 600, 320, 10),
    num('hum_panel_height', 'Висота панелі', 40, 220, 54, 1),
    num('hum_panel_radius', 'Заокруглення панелі', 0, 100, 28, 1),
    num('hum_panel_padding_x', 'Внутрішній відступ X', 0, 40, 5, 1),
    num('hum_display_width', 'Ширина дисплея', 40, 260, 90, 1),
    num('hum_display_height', 'Висота дисплея', 20, 160, 42, 1),
    num('hum_display_radius', 'Заокруглення дисплея', 0, 80, 12, 1),
    num('hum_btn_size', 'Діаметр кнопок ±', 20, 160, 40, 1),
    num('hum_btn_icon_size', 'Розмір іконок ±', 8, 64, 20, 1),
    num('hum_panel_bottom', 'Положення по вертикалі Y', -100, 500, 110, 1),
  ]),

  section('buttons', '🔘', 'Нижні кнопки', [
    tog('show_btns', 'Показати кнопки', true),
    num('btn_height', 'Висота кнопок', 20, 120, 54, 1),
    num('btn_icon_size', 'Розмір іконок', 8, 60, 18, 1),
    num('btn_label_size', 'Розмір підписів', 6, 30, 8, 1),
    num('fan_text_size', 'Розмір таймера вентилятора', 6, 40, 15, 1),
    tog('show_badge', 'Показати бейдж статусу', true),
    num('badge_width', 'Ширина бейджа (%)', 40, 100, 92, 1),
    num('badge_height', 'Висота бейджа', 10, 50, 22, 1),
    num('badge_radius', 'Заокруглення бейджа', 0, 30, 6, 1),
    num('badge_size', 'Розмір тексту бейджа', 4, 30, 9.5, 0.5),
    num('badge_font_weight', 'Жирність тексту бейджа', 100, 900, 900, 100),
    txt('btn_off_label', 'Підпис OFF', 'OFF'),
    txt('btn_on_label', 'Підпис ON', 'ON'),
    txt('btn_manual_label', 'Підпис MANUAL', 'MANUAL'),
    txt('btn_off_icon', 'Іконка OFF', 'mdi:power-cycle'),
    txt('btn_on_icon', 'Іконка ON', 'mdi:fan'),
    txt('btn_manual_icon', 'Іконка MANUAL', 'mdi:gesture-tap'),
    num('btns_bottom', 'Положення блоку по вертикалі Y', -100, 300, 14, 1),
    num('badge_offset_y', 'Положення бейджа по вертикалі Y', -100, 100, 0, 1),
  ]),

  section('effects', '✨', 'Візуальні ефекти', [
    tog('efx_fan_show', 'Увімкнути фоновий вентилятор', true),
    num('efx_fan_size', 'Розмір вентилятора', 50, 600, 240, 10),
    num('efx_fan_opacity', 'Прозорість вентилятора (%)', 0, 100, 10, 1),
    num('efx_fan_speed', 'Швидкість вентилятора (1-100)', 1, 100, 25, 1),
    tog('efx_comet_show', 'Увімкнути комету (орбіту)', true),
    num('efx_comet_size', 'Розмір орбіти', 50, 600, 320, 10),
    num('efx_comet_speed', 'Швидкість комети (1-100)', 1, 100, 66, 1),
    tog('efx_core_show', 'Увімкнути пульсуюче ядро', true),
    num('efx_core_size', 'Розмір ядра', 50, 500, 160, 10),
    num('efx_core_speed', 'Швидкість пульсації (1-100)', 1, 100, 50, 1),
    tog('efx_part_show', 'Увімкнути частинки', true),
    num('efx_part_count', 'Кількість частинок', 5, 100, 25, 1),
    num('efx_part_spread', 'Радіус розлітання частинок', 50, 600, 250, 10),
    num('efx_part_speed', 'Швидкість частинок (1-100)', 1, 100, 66, 1),
    num('efx_offset_y', 'Положення по вертикалі Y', -200, 200, 0, 1),
  ]),
];
