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
/**
 * Auto-bind from Smart Dehumidifier integration.
 * Primary source: status sensor attributes (set by coordinator).
 * No card-form entity pickers required.
 */
export function resolveSdEntities(hass, config = {}) {
  const out = {
    entity: '',
    fan_entity: '',
    current_humidity_entity: '',
    room_humidity_entity: '',
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
    // Offline: keep any explicit config (advanced YAML only)
    for (const k of Object.keys(out)) {
      if (config[k]) out[k] = config[k];
    }
    return out;
  }

  try {
    const registry = hass.entities || {};
    const states = hass.states || {};

    const isOurs = (entityId, info = {}) => {
      const platform = String(info.platform || '');
      const uid = String(info.unique_id || '');
      return (
        platform === 'smart_dehumidifier' ||
        uid.includes('smart_dehumidifier') ||
        /smart_dehumidifier/i.test(entityId)
      );
    };

    // 1) Find status sensor(s)
    const statusCandidates = [];
    for (const entityId of Object.keys(states)) {
      if (!entityId.startsWith('sensor.')) continue;
      const info = registry[entityId] || {};
      const oid = entityId.split('.').slice(1).join('.');
      if (!isOurs(entityId, info) && !/_status$/i.test(oid)) continue;
      if (!/status$/i.test(oid) && !String(info.unique_id || '').endsWith('_status')) continue;
      statusCandidates.push(entityId);
    }
    // prefer entity whose attributes list humidifier
    let statusId = '';
    for (const id of statusCandidates) {
      const attrs = states[id]?.attributes || {};
      if (attrs.humidifier_entity) {
        statusId = id;
        break;
      }
    }
    if (!statusId && statusCandidates.length) statusId = statusCandidates[0];
    out.status_entity = statusId;

    const attrs = statusId ? (states[statusId]?.attributes || {}) : {};

    // 2) Linked entities from integration (source of truth)
    out.entity = attrs.humidifier_entity || '';
    out.fan_entity = attrs.fan_entity || '';
    out.current_humidity_entity = attrs.bathroom_humidity_entity || '';
    out.room_humidity_entity = attrs.room_humidity_entity || '';
    out.auto_entity = attrs.auto_entity || '';
    out.calc_entity = attrs.recommended_entity || '';
    out.delta_entity = attrs.delta_entity || '';
    out.min_rh_entity = attrs.min_rh_entity || '';
    out.max_rh_entity = attrs.max_rh_entity || '';
    out.manual_runtime_entity = attrs.manual_runtime_entity || '';
    out.manual_pause_runtime_entity = attrs.pause_runtime_entity || '';

    // 3) Fill gaps via registry discovery on same device as status
    const statusInfo = statusId ? registry[statusId] || {} : {};
    const deviceId = statusInfo.device_id || null;

    const matchers = [
      { key: 'manual_runtime_entity', re: /(?:^|[._-])manual_runtime$/i },
      { key: 'manual_pause_runtime_entity', re: /(?:^|[._-])pause_runtime$/i },
      { key: 'min_rh_entity', re: /(?:^|[._-])(?:auto_)?min_rh$/i },
      { key: 'max_rh_entity', re: /(?:^|[._-])(?:auto_)?max_rh$/i },
      { key: 'calc_entity', re: /(?:^|[._-])recommended$/i },
      { key: 'manual_script_entity', re: /(?:^|[._-])manual_toggle$/i },
      { key: 'delta_entity', re: /(?:^|[._-])delta$/i },
      { key: 'auto_entity', re: /(?:^|[._-])auto$/i },
    ];

    const objectId = (entityId) => {
      const parts = String(entityId).split('.');
      return parts.length > 1 ? parts.slice(1).join('.') : String(entityId);
    };

    for (const [entityId, info] of Object.entries(registry)) {
      if (!isOurs(entityId, info) && !(deviceId && info.device_id === deviceId)) continue;
      if (deviceId && info.device_id && info.device_id !== deviceId && info.platform !== 'smart_dehumidifier') {
        continue;
      }
      const oid = objectId(entityId);
      const uid = String(info.unique_id || '');
      for (const { key, re } of matchers) {
        if (out[key]) continue;
        if (re.test(oid) || re.test(uid)) {
          if (key === 'auto_entity' && /min_rh|max_rh/i.test(oid)) continue;
          out[key] = entityId;
        }
      }
    }

    // 4) Optional advanced YAML overrides (not from form editor)
    for (const k of Object.keys(out)) {
      if (config[k]) out[k] = config[k];
    }

    sdLog('debug', 'resolveSdEntities', {
      status: out.status_entity,
      entity: out.entity,
      auto: out.auto_entity,
      delta: out.delta_entity,
      room: out.room_humidity_entity,
    });
  } catch (err) {
    sdLog('error', 'resolveSdEntities failed', err);
    for (const k of Object.keys(out)) {
      if (config[k]) out[k] = config[k];
    }
  }

  return out;
}
