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


const SD_LOG_MAX = 250;

/** Ring-buffer logs for debugging: copy via `copy(window.__SD_LOGS__)` in browser console. */
export function sdLog(level, ...args) {
  try {
    if (typeof window !== 'undefined') {
      window.__SD_LOGS__ = window.__SD_LOGS__ || [];
      window.__SD_LOGS__.push({
        t: new Date().toISOString(),
        level,
        msg: args.map((a) => {
          try {
            if (a instanceof Error) return a.message;
            if (typeof a === 'object') return JSON.stringify(a);
            return String(a);
          } catch (_e) {
            return String(a);
          }
        }).join(' '),
      });
      if (window.__SD_LOGS__.length > SD_LOG_MAX) {
        window.__SD_LOGS__.splice(0, window.__SD_LOGS__.length - SD_LOG_MAX);
      }
    }
  } catch (_e) {}
  const fn = console[level] || console.log;
  fn.call(console, '[SmartDehumidifier]', ...args);
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

  const HELPER_KEYS = [
    'status_entity', 'auto_entity', 'calc_entity', 'manual_script_entity',
    'delta_entity', 'min_rh_entity', 'max_rh_entity',
    'manual_runtime_entity', 'manual_pause_runtime_entity',
  ];

  if (!hass) {
    for (const k of HELPER_KEYS) {
      if (config[k]) out[k] = config[k];
    }
    return out;
  }

  let registry = {};
  try {
  registry = hass.entities || {};
  const main = out.entity;
  const mainReg = main ? registry[main] : null;
  const deviceId = mainReg?.device_id || null;

  // Longest / most specific first
  const matchers = [
    { key: 'manual_runtime_entity', re: /(?:^|[._-])manual_runtime$/i },
    { key: 'manual_pause_runtime_entity', re: /(?:^|[._-])pause_runtime$/i },
    { key: 'min_rh_entity', re: /(?:^|[._-])(?:auto_)?min_rh$/i },
    { key: 'max_rh_entity', re: /(?:^|[._-])(?:auto_)?max_rh$/i },
    { key: 'calc_entity', re: /(?:^|[._-])recommended$/i },
    { key: 'manual_script_entity', re: /(?:^|[._-])manual_toggle$/i },
    { key: 'status_entity', re: /(?:^|[._-])status$/i },
    { key: 'delta_entity', re: /(?:^|[._-])delta$/i },
    { key: 'auto_entity', re: /(?:^|[._-])auto$/i },
  ];

  const found = {};
  const objectId = (entityId) => {
    const parts = String(entityId).split('.');
    return parts.length > 1 ? parts.slice(1).join('.') : String(entityId);
  };

  const scoreCandidate = (entityId, info = {}) => {
    const uid = String(info.unique_id || '');
    const platform = String(info.platform || '');
    const sameDevice = !!(deviceId && info.device_id === deviceId);
    const oid = objectId(entityId);
    let score = 0;
    if (platform === 'smart_dehumidifier') score += 50;
    if (uid.includes('smart_dehumidifier')) score += 30;
    if (sameDevice) score += 40;
    if (/smart_dehumidifier|dehumidifier/i.test(entityId)) score += 20;
    return { score, uid, platform, sameDevice, oid };
  };

  const tryMatch = (entityId, info = {}) => {
    const meta = scoreCandidate(entityId, info);
    if (meta.score < 20) return;
    for (const { key, re } of matchers) {
      if (found[key] && found[key].score >= meta.score) continue;
      if (re.test(meta.oid) || re.test(meta.uid)) {
        // avoid auto matching auto_min_rh / auto_max_rh
        if (key === 'auto_entity' && /min_rh|max_rh|humidity/i.test(meta.oid)) continue;
        if (key === 'status_entity' && /recommended/i.test(meta.oid)) continue;
        found[key] = { id: entityId, score: meta.score };
      }
    }
  };

  for (const [entityId, info] of Object.entries(registry)) {
    tryMatch(entityId, info || {});
  }
  for (const entityId of Object.keys(hass.states || {})) {
    tryMatch(entityId, registry[entityId] || {});
  }

  for (const k of HELPER_KEYS) {
    out[k] = (found[k] && found[k].id) || config[k] || '';
  }

  sdLog('debug', 'resolveSdEntities', {
    deviceId,
    delta: out.delta_entity,
    min: out.min_rh_entity,
    max: out.max_rh_entity,
    auto: out.auto_entity,
    calc: out.calc_entity,
  });
  } catch (err) {
    sdLog('error', 'resolveSdEntities failed', err);
    for (const k of HELPER_KEYS) {
      if (config[k]) out[k] = config[k];
    }
  }

  return out;
}
