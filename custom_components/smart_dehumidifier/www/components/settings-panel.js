import { html } from '../files/lit-proxy.js?v=1.8.2';
import { t } from '../i18n.js?v=1.8.2';
import { resolveSdEntities, sdLog } from '../dh-utils.js?v=1.8.2';

/**
 * Gear settings: auto humidity + timers + language.
 * Values adjusted only with + / − (no range sliders).
 */
export function renderSettingsPanel(card, config) {
  if (!card._isSettingsOpen) return html``;

  if (card._openSections === undefined) {
    card._openSections = { auto: false, manual: false, lang: false };
  }

  const hass = card._hass;
  if (!hass) return html``;

  const cfg = config || card._config || {};

  const getVal = (id, def) => {
    if (!id || !hass.states[id]) return def;
    const n = Number(hass.states[id].state);
    return Number.isFinite(n) ? n : def;
  };

  const resolved = resolveSdEntities(hass, cfg);
  const entities = {
    delta: resolved.delta_entity || '',
    min: resolved.min_rh_entity || '',
    max: resolved.max_rh_entity || '',
    calc: resolved.calc_entity || '',
    runtime: resolved.manual_runtime_entity || '',
    pause: resolved.manual_pause_runtime_entity || '',
  };

  sdLog('debug', 'gear entities', entities);

  const vals = {
    delta: getVal(entities.delta, 3),
    min: getVal(entities.min, 65),
    max: getVal(entities.max, 85),
    runtime: getVal(entities.runtime, 20),
    pause: getVal(entities.pause, 20),
    recommended:
      entities.calc && hass.states[entities.calc]
        ? hass.states[entities.calc].state
        : '--',
  };

  const roomId = resolved.room_humidity_entity || cfg.room_humidity_entity || '';
  const statusId = resolved.status_entity || '';
  const statusAttrs = statusId && hass.states[statusId] ? hass.states[statusId].attributes : {};
  const autoAvailable =
    statusAttrs.auto_available === true ||
    (!!roomId && !!hass.states[roomId]) ||
    (!!entities.delta && !!hass.states[entities.delta]);

  const missing = autoAvailable && (!entities.delta || !entities.min || !entities.max);

  const setNumber = async (entityId, value) => {
    if (!entityId || !hass) {
      sdLog('warn', 'setNumber: missing entity', entityId);
      return;
    }
    const domain = String(entityId).split('.')[0];
    const svc = domain === 'number' ? 'number' : 'input_number';
    const num = Number(value);
    try {
      await hass.callService(svc, 'set_value', {
        entity_id: entityId,
        value: num,
      });
      sdLog('info', 'set_value ok', entityId, num);
    } catch (err) {
      sdLog('error', 'set_value failed', entityId, err);
    }
  };

  const clampStep = (value, min, max, step) => {
    const s = Number(step) || 1;
    let v = Math.round(Number(value) / s) * s;
    v = Math.min(max, Math.max(min, v));
    const decimals = (String(s).split('.')[1] || '').length;
    return Number(v.toFixed(decimals));
  };

  const bump = (entityId, current, min, max, step, dir) => {
    if (!entityId) return;
    const next = clampStep(Number(current) + dir * step, min, max, step);
    setNumber(entityId, next);
  };

  const setLanguage = (lang) => {
    const next = { ...cfg, language: lang };
    card._config = next;
    try {
      localStorage.setItem('sd_card_lang', lang);
    } catch (_e) {}
    sdLog('info', 'language set', lang);
    card.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: next },
        bubbles: true,
        composed: true,
      })
    );
    card.requestUpdate();
  };

  let currentLang = (cfg.language || cfg.lang || '').toLowerCase();
  if (!currentLang || !['uk', 'ru', 'en'].includes(currentLang)) {
    try {
      currentLang = localStorage.getItem('sd_card_lang') || '';
    } catch (_e) {
      currentLang = '';
    }
  }
  if (!currentLang) {
    currentLang = 'uk';
  }

  const toggleSection = (id) => {
    card._openSections[id] = !card._openSections[id];
    card.requestUpdate();
  };

  const close = () => {
    card._isSettingsOpen = false;
    card.requestUpdate();
  };

  const tt = (key) => t(hass, key, { ...cfg, language: currentLang });

  const stepRow = (label, entityId, value, min, max, step, unit) => html`
    <div class="sp-row">
      <div class="sp-label-line">
        <span class="sp-label">${label}</span>
      </div>
      <div class="sp-stepper">
        <button
          type="button"
          class="sp-step-btn"
          ?disabled=${!entityId || value <= min}
          @click=${() => bump(entityId, value, min, max, step, -1)}
        >
          −
        </button>
        <span class="sp-step-val">${value}${unit}</span>
        <button
          type="button"
          class="sp-step-btn"
          ?disabled=${!entityId || value >= max}
          @click=${() => bump(entityId, value, min, max, step, 1)}
        >
          +
        </button>
      </div>
      ${!entityId ? html`<div class="sp-warn">—</div>` : html``}
    </div>
  `;

  const stopScrollBubble = (e) => e.stopPropagation();

  return html`
    <style>
      .sp-overlay {
        position: absolute;
        inset: 0;
        z-index: 1000;
        background: rgba(4, 8, 14, 0.75);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        box-sizing: border-box;
        touch-action: none;
      }
      .sp-modal {
        width: 100%;
        max-width: 320px;
        max-height: min(85%, 90dvh);
        min-height: 0;
        background: linear-gradient(145deg, rgba(30, 36, 48, 0.98), rgba(12, 16, 24, 0.98));
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.55);
        touch-action: auto;
      }
      .sp-header {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .sp-title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.55);
      }
      .sp-close {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sp-close ha-icon {
        --mdc-icon-size: 16px;
      }
      .sp-scroll {
        flex: 1 1 auto;
        min-height: 0;
        padding: 10px;
        overflow-x: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        touch-action: pan-y;
        display: flex;
        flex-direction: column;
        gap: 8px;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 212, 255, 0.45) transparent;
      }
      .sp-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .sp-scroll::-webkit-scrollbar-thumb {
        background: rgba(0, 212, 255, 0.4);
        border-radius: 3px;
      }
      .sp-panel {
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 14px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.02);
        flex-shrink: 0;
      }
      .sp-head {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        border: none;
        background: transparent;
        color: #fff;
        cursor: pointer;
        text-align: left;
      }
      .sp-head-label {
        font-size: 13px;
        font-weight: 600;
      }
      .sp-body {
        padding: 4px 14px 14px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .sp-hud {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(0, 212, 255, 0.08);
        border: 1px solid rgba(0, 212, 255, 0.2);
      }
      .sp-hud-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: rgba(0, 212, 255, 0.7);
      }
      .sp-hud-sub {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.35);
        margin-top: 2px;
      }
      .sp-hud-val {
        font-size: 26px;
        font-weight: 800;
        color: #00d4ff;
      }
      .sp-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .sp-label-line {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .sp-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.35);
      }
      .sp-stepper {
        display: grid;
        grid-template-columns: 44px 1fr 44px;
        align-items: center;
        gap: 10px;
      }
      .sp-step-btn {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
        font-size: 22px;
        font-weight: 600;
        line-height: 1;
        cursor: pointer;
        touch-action: manipulation;
      }
      .sp-step-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .sp-step-btn:not(:disabled):active {
        background: rgba(0, 212, 255, 0.2);
        border-color: rgba(0, 212, 255, 0.45);
      }
      .sp-step-val {
        text-align: center;
        font-size: 18px;
        font-weight: 800;
        color: rgba(255, 255, 255, 0.95);
        font-variant-numeric: tabular-nums;
      }
      .sp-warn {
        font-size: 10px;
        color: #ffb020;
        line-height: 1.35;
      }
      .sp-lang {
        display: flex;
        gap: 8px;
      }
      .sp-lang button {
        flex: 1;
        padding: 10px 6px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 800;
        letter-spacing: 1px;
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.04);
      }
      .sp-lang button.active {
        border-color: rgba(0, 212, 255, 0.55);
        background: rgba(0, 212, 255, 0.14);
      }
      .sp-log-hint {
        font-size: 9px;
        color: rgba(255, 255, 255, 0.28);
        text-align: center;
        padding: 4px 8px 2px;
      }
    </style>

    <div
      class="sp-overlay"
      @click=${(e) => {
        if (e.target.classList.contains('sp-overlay')) close();
      }}
    >
      <div
        class="sp-modal"
        @click=${(e) => e.stopPropagation()}
        @touchmove=${stopScrollBubble}
        @wheel=${stopScrollBubble}
      >
        <div class="sp-header">
          <div class="sp-title">${tt('settings')}</div>
          <button class="sp-close" type="button" @click=${close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>

        <div class="sp-scroll" @touchmove=${stopScrollBubble}>
          ${missing
            ? html`<div class="sp-warn">
                ${tt('entities_missing')}
              </div>`
            : html``}

          ${autoAvailable
            ? html`
          <div class="sp-panel">
            <button class="sp-head" type="button" @click=${() => toggleSection('auto')}>
              <span class="sp-head-label">${tt('auto_humidity')}</span>
              <ha-icon icon="mdi:chevron-${card._openSections.auto ? 'up' : 'down'}"></ha-icon>
            </button>
            ${card._openSections.auto
              ? html`
                  <div class="sp-body">
                    <div class="sp-hud">
                      <div>
                        <div class="sp-hud-label">${tt('recommended')}</div>
                        <div class="sp-hud-sub">${tt('room_hint')}</div>
                      </div>
                      <div class="sp-hud-val">${vals.recommended}%</div>
                    </div>
                    ${stepRow(tt('delta'), entities.delta, vals.delta, 0, 20, 0.5, '%')}
                    ${stepRow(tt('min_rh'), entities.min, vals.min, 20, 90, 1, '%')}
                    ${stepRow(tt('max_rh'), entities.max, vals.max, 30, 99, 1, '%')}
                  </div>
                `
              : html``}
          </div>
            `
            : html``}

          <div class="sp-panel">
            <button class="sp-head" type="button" @click=${() => toggleSection('manual')}>
              <span class="sp-head-label">${tt('timers')}</span>
              <ha-icon
                icon="mdi:chevron-${card._openSections.manual ? 'up' : 'down'}"
              ></ha-icon>
            </button>
            ${card._openSections.manual
              ? html`
                  <div class="sp-body">
                    ${stepRow(
                      tt('runtime'),
                      entities.runtime,
                      vals.runtime,
                      1,
                      240,
                      1,
                      ` ${tt('min')}`
                    )}
                    ${stepRow(
                      tt('pause_time'),
                      entities.pause,
                      vals.pause,
                      1,
                      240,
                      1,
                      ` ${tt('min')}`
                    )}
                  </div>
                `
              : html``}
          </div>

          <div class="sp-panel">
            <button class="sp-head" type="button" @click=${() => toggleSection('lang')}>
              <span class="sp-head-label">${tt('language')}</span>
              <ha-icon icon="mdi:chevron-${card._openSections.lang ? 'up' : 'down'}"></ha-icon>
            </button>
            ${card._openSections.lang
              ? html`
                  <div class="sp-body">
                    <div class="sp-lang">
                      ${['uk', 'ru', 'en'].map(
                        (code) => html`
                          <button
                            type="button"
                            class="${currentLang === code ? 'active' : ''}"
                            @click=${() => setLanguage(code)}
                          >
                            ${code.toUpperCase()}
                          </button>
                        `
                      )}
                    </div>
                  </div>
                `
              : html``}
          </div>

          <div class="sp-log-hint">logs: window.__SD_LOGS__</div>
        </div>
      </div>
    </div>
  `;
}
