import { html } from '../files/lit-proxy.js?v=1.6.2';
import { t } from '../i18n.js?v=1.6.2';
import { resolveSdEntities } from '../dh-utils.js?v=1.6.2';

/**
 * Gear settings: automatic humidity + timers + language.
 * Scrollable modal; sections collapsed by default.
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

  const vals = {
    delta: getVal(entities.delta, 3),
    min: getVal(entities.min, 45),
    max: getVal(entities.max, 65),
    runtime: getVal(entities.runtime, 20),
    pause: getVal(entities.pause, 20),
    recommended:
      entities.calc && hass.states[entities.calc]
        ? hass.states[entities.calc].state
        : '--',
  };

  const missing = !entities.delta || !entities.min || !entities.max;

  const setNumber = async (entityId, value) => {
    if (!entityId || !hass) {
      console.warn(
        '[Smart Dehumidifier] No entity for slider — set entities in card editor'
      );
      return;
    }
    const domain = String(entityId).split('.')[0];
    const svc = domain === 'number' ? 'number' : 'input_number';
    try {
      await hass.callService(svc, 'set_value', {
        entity_id: entityId,
        value: Number(value),
      });
    } catch (err) {
      console.error('[Smart Dehumidifier] set_value failed', entityId, err);
    }
  };

  const onSlide = (entityId) => (e) => {
    const v = e.target.value;
    const row = e.target.closest('.sp-row');
    const label = row && row.querySelector('.sp-val');
    if (label) {
      const unit = e.target.dataset.unit || '';
      label.textContent = `${v}${unit}`;
    }
  };

  const onCommit = (entityId) => (e) => {
    setNumber(entityId, e.target.value);
  };

  const setLanguage = (lang) => {
    const next = { ...cfg, language: lang };
    card._config = next;
    try {
      localStorage.setItem('sd_card_lang', lang);
    } catch (_e) {}
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
    const raw = (hass.locale && hass.locale.language) || hass.language || 'en';
    const code = String(raw).toLowerCase().slice(0, 2);
    currentLang = code === 'uk' || code === 'ua' ? 'uk' : code === 'ru' ? 'ru' : 'en';
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

  const sliderRow = (label, entityId, value, min, max, step, unit) => html`
    <div class="sp-row">
      <div class="sp-label-line">
        <span class="sp-label">${label}</span>
        <span class="sp-val">${value}${unit}</span>
      </div>
      <input
        class="sp-slider"
        type="range"
        min=${min}
        max=${max}
        step=${step}
        .value=${String(value)}
        data-unit=${unit}
        ?disabled=${!entityId}
        @input=${onSlide(entityId)}
        @change=${onCommit(entityId)}
      />
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
        gap: 6px;
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
      .sp-val {
        font-size: 14px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.9);
      }
      .sp-slider {
        width: 100%;
        height: 28px;
        margin: 0;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        touch-action: pan-y;
      }
      .sp-slider:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .sp-slider::-webkit-slider-runnable-track {
        height: 4px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.12);
      }
      .sp-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        margin-top: -7px;
        border-radius: 50%;
        background: #00d4ff;
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.55);
        border: 2px solid #0a1018;
      }
      .sp-slider::-moz-range-track {
        height: 4px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.12);
      }
      .sp-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #00d4ff;
        border: 2px solid #0a1018;
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
                Не знайдено entity інтеграції Smart Dehumidifier. Додай інтеграцію і
                вкажи humidifier у картці.
              </div>`
            : html``}

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
                    ${sliderRow(tt('delta'), entities.delta, vals.delta, 0.5, 15, 0.5, '%')}
                    ${sliderRow(tt('min_rh'), entities.min, vals.min, 30, 90, 1, '%')}
                    ${sliderRow(tt('max_rh'), entities.max, vals.max, 30, 95, 1, '%')}
                  </div>
                `
              : html``}
          </div>

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
                    ${sliderRow(
                      tt('runtime'),
                      entities.runtime,
                      vals.runtime,
                      1,
                      180,
                      1,
                      ` ${tt('min')}`
                    )}
                    ${sliderRow(
                      tt('pause_time'),
                      entities.pause,
                      vals.pause,
                      1,
                      180,
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
        </div>
      </div>
    </div>
  `;
}
