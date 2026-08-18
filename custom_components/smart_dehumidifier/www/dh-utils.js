export const DEFAULT_LAYOUT_BASE_WIDTH = 400;
export const DEFAULT_CONTROLS_MAX_WIDTH = 520;
export const TARGET_SYNC_GRACE_MS = 1800;

export function toFiniteNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function toPositiveNumber(value, fallback, min = 1) {
  return Math.max(min, toFiniteNumber(value, fallback));
}

export function clamp(value, min, max) {
  return Math.min(Math.max(toFiniteNumber(value, min), min), max);
}

export function layoutUnit(value, layoutBaseWidth = DEFAULT_LAYOUT_BASE_WIDTH) {
  const base = toPositiveNumber(layoutBaseWidth, DEFAULT_LAYOUT_BASE_WIDTH);
  return `${(toFiniteNumber(value, 0) / base) * 100}cqw`;
}

export function getEntityState(card, entityId) {
  return entityId ? card?._hass?.states?.[entityId] : undefined;
}

export function readNumberState(card, entityId) {
  const stateObj = getEntityState(card, entityId);
  if (!stateObj) return null;
  const raw = Number(stateObj.state);
  return Number.isFinite(raw) ? raw : null;
}

export function isEntityOn(card, entityId) {
  return getEntityState(card, entityId)?.state === 'on';
}

export function isMainEntityOn(card, entityId) {
  const state = getEntityState(card, entityId)?.state;
  return !!state && state !== 'off' && state !== 'unavailable' && state !== 'unknown';
}

export function callHA(card, domain, service, data = {}) {
  if (!card?._hass) return;
  card._hass.callService(domain, service, data);
}

export function readHumidityTarget(card, entityId, fallback = 50) {
  const attrs = getEntityState(card, entityId)?.attributes || {};
  if (attrs.target_humidity !== undefined) return clamp(attrs.target_humidity, 0, 100);
  if (attrs.humidity !== undefined) return clamp(attrs.humidity, 0, 100);
  return clamp(fallback, 0, 100);
}

export function readCurrentHumidity(card, config = {}, fallback = 50) {
  const hass = card?._hass;
  const currentEntity =
    config.current_humidity_entity ||
    config.humidity_entity ||
    config.current_entity;

  if (currentEntity && hass?.states?.[currentEntity]) {
    return clamp(hass.states[currentEntity].state, 0, 100);
  }

  const attrs = getEntityState(card, config.entity)?.attributes || {};
  if (attrs.current_humidity !== undefined) return clamp(attrs.current_humidity, 0, 100);
  if (attrs.humidity !== undefined) return clamp(attrs.humidity, 0, 100);
  return clamp(fallback, 0, 100);
}

export function formatElapsedSince(lastChanged, now = Date.now()) {
  if (!lastChanged) return null;

  const startedAt = new Date(lastChanged).getTime();
  if (!Number.isFinite(startedAt)) return null;

  const diffSecs = Math.max(0, Math.floor((now - startedAt) / 1000));
  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Auto-bind Smart Dehumidifier integration entities.
 * Helper numbers/sensors/switches always prefer discovery from the same device
 * as the main humidifier — no manual card editor wiring needed.
 */
export function resolveSdEntities(hass, config = {}) {
  const out = {
    entity: config.entity || '',
    fan_entity: config.fan_entity || '',
    current_humidity_entity: config.current_humidity_entity || '',
    room_humidity_entity: config.room_humidity_entity || '',
    // helpers filled by discovery (config only as weak fallback)
    status_entity: '',
    auto_entity: '',
    calc_entity: '',
    manual_script_entity: '',
    delta_entity: '',
    min_rh_entity: '',
    max_rh_entity: '',
    manual_runtime_entity: '',
    manual_pause_runtime_entity: '',
  };

  if (!hass) {
    // no hass yet — keep any explicit config helpers
    for (const k of [
      'status_entity', 'auto_entity', 'calc_entity', 'manual_script_entity',
      'delta_entity', 'min_rh_entity', 'max_rh_entity',
      'manual_runtime_entity', 'manual_pause_runtime_entity',
    ]) {
      if (config[k]) out[k] = config[k];
    }
    return out;
  }

  const registry = hass.entities || {};
  const main = out.entity;
  const mainReg = main ? registry[main] : null;
  const deviceId = mainReg?.device_id || null;

  const suffixMap = [
    ['_delta', 'delta_entity'],
    ['_min_rh', 'min_rh_entity'],
    ['_max_rh', 'max_rh_entity'],
    ['_manual_runtime', 'manual_runtime_entity'],
    ['_pause_runtime', 'manual_pause_runtime_entity'],
    ['_auto', 'auto_entity'],
    ['_status', 'status_entity'],
    ['_recommended', 'calc_entity'],
    ['_manual_toggle', 'manual_script_entity'],
  ];

  const found = {};

  const consider = (entityId, info = {}, force = false) => {
    const uid = String(info.unique_id || '');
    const platform = String(info.platform || '');
    const sameDevice = deviceId && info.device_id === deviceId;
    const isOurs =
      platform === 'smart_dehumidifier' ||
      uid.includes('smart_dehumidifier') ||
      sameDevice;

    if (!isOurs && !force) return;

    for (const [suffix, key] of suffixMap) {
      if (found[key]) continue;
      if (uid.endsWith(suffix) || (uid.includes(suffix) && platform === 'smart_dehumidifier')) {
        found[key] = entityId;
        continue;
      }
      const id = entityId.toLowerCase();
      const token = suffix.slice(1);
      if (
        id.includes(token) &&
        (platform === 'smart_dehumidifier' ||
          id.includes('smart_dehumidifier') ||
          (sameDevice && (id.startsWith('number.') || id.startsWith('sensor.') || id.startsWith('switch.') || id.startsWith('button.'))))
      ) {
        found[key] = entityId;
      }
    }
  };

  // 1) same device + our platform from registry
  for (const [entityId, info] of Object.entries(registry)) {
    if (deviceId && info.device_id && info.device_id !== deviceId && info.platform !== 'smart_dehumidifier') {
      continue;
    }
    consider(entityId, info);
  }

  // 2) states fallback
  for (const entityId of Object.keys(hass.states || {})) {
    consider(entityId, registry[entityId] || {}, true);
  }

  for (const [, key] of suffixMap) {
    out[key] = found[key] || config[key] || '';
  }

  return out;
}
