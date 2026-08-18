import { html, css, LitElement, unsafeCSS } from './files/lit-proxy.js?v=1.7.0';

import { renderArcSlider } from './components/arc-slider.js?v=1.7.0';
import { renderCurrentHumidity } from './components/current-humidity.js?v=1.7.0';
import { renderHumidityPanel } from './components/humidity-panel.js?v=1.7.0';
import { renderBottomControls } from './components/bottom-controls.js?v=1.7.0';
import { renderVisualEffects } from './components/visual-effects.js?v=1.7.0';
import { renderSettingsPanel } from './components/settings-panel.js?v=1.7.0';

import {
  toFiniteNumber,
  toPositiveNumber,
  formatElapsedSince,
  resolveSdEntities,
} from './dh-utils.js?v=1.7.0';

const DEFAULT_BORDER_RADIUS = 28;
const DEFAULT_HEIGHT_PERCENT = 100;
const TICK_MS = 1000;
const NOISE_DATA_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

function normalizeAlign(value) {
  return value === 'left' || value === 'right' ? value : 'center';
}

function extractTrackedEntities(config = {}) {
  const ids = new Set();

  for (const [key, value] of Object.entries(config)) {
    if (!value) continue;

    if (key === 'entity' || key.endsWith('_entity')) {
      if (typeof value === 'string' && value.trim()) ids.add(value);
      continue;
    }

    if (key.endsWith('_entities') && Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim()) ids.add(item);
      }
    }
  }


  return [...ids];
}

function hasTrackedEntityChange(prevHass, nextHass, entityIds) {
  if (!prevHass || !nextHass) return true;
  if (!entityIds?.length) return true;

  const prevStates = prevHass.states || {};
  const nextStates = nextHass.states || {};

  for (const entityId of entityIds) {
    if ((prevStates[entityId] || null) !== (nextStates[entityId] || null)) {
      return true;
    }
  }

  return false;
}

class MyDehumidifierCard extends LitElement {
  static properties = {
    _config: { state: true },
    _hass: { state: true },
    // _tick ВИДАЛЕНО: таймер більше не провокує щосекундний повний рендер
    _targetHumidity: { state: true },
    _isSettingsOpen: { state: true },
    _humPanelAutoPopupOpen: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      container-type: inline-size;
    }

    ha-card {
      position: relative;
      overflow: hidden;
      background: transparent;
      border: none;
      box-shadow: none;
      padding: 0;
      margin: 0;
      width: 100%;
      max-width: none;
      aspect-ratio: var(--dh-glass-ar-mobile, 1);
      box-sizing: border-box;
      border-radius: var(--dh-card-radius, 28px);
      display: flex;
      align-items: center;
      justify-content: var(--dh-justify, center);
      container-type: size;
    }

    @container (min-width: 480px) {
      ha-card { aspect-ratio: var(--dh-glass-ar-wide, 1.8); }
    }

    .dh-card-bg,
    .dh-card-bg__base,
    .dh-card-bg__vignette,
    .dh-card-bg__glass-curve,
    .dh-card-bg__specular,
    .dh-card-bg__noise,
    .dh-card-bg__top-line,
    .dh-card-bg__edge {
      position: absolute;
    }

    .dh-card-bg {
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
      border-radius: var(--dh-card-radius, 28px);
      background-color: #05070a;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
    }

    .dh-card-bg__base,
    .dh-card-bg__vignette,
    .dh-card-bg__noise,
    .dh-card-bg__edge { inset: 0; }

    .dh-card-bg__base {
      background: linear-gradient(180deg, #242a33 0%, #0b0e14 40%, #030406 100%);
    }

    .dh-card-bg__glass-curve {
      top: 0;
      left: 0;
      right: 0;
      height: clamp(120px, 45%, 300px);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 85%, transparent 100%);
      border-radius: 0 0 50% 50% / 0 0 25px 25px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }

    .dh-card-bg__specular {
      top: -20%;
      left: 50%;
      transform: translateX(-50%);
      width: min(150%, 800px);
      aspect-ratio: 2 / 1;
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.03) 40%, transparent 70%);
      mix-blend-mode: screen;
      filter: blur(8px);
    }

    .dh-card-bg__vignette {
      background: radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.8) 140%);
    }

    .dh-card-bg__noise {
      opacity: 0.03;
      background-image: ${unsafeCSS(NOISE_DATA_URI)};
      mix-blend-mode: overlay;
    }

    .dh-card-bg__edge {
      border-radius: inherit;
      box-shadow:
        inset 0 0 0 2px rgba(255, 255, 255, 0.15),
        inset 0 0 20px 2px rgba(255, 255, 255, 0.08),
        inset 0 2px 8px rgba(255, 255, 255, 0.35),
        inset 0 -2px 8px rgba(255, 255, 255, 0.15);
    }

    .dh-card-bg__top-line {
      top: 0;
      left: 5%;
      right: 5%;
      height: 2px;
      opacity: 0.9;
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.3) 80%, rgba(255,255,255,0) 100%);
      box-shadow: 0 1px 8px rgba(255,255,255,0.6);
    }

    .dh-frame {
      width: min(100cqi, calc(100cqb * var(--dh-frame-ar-num, 1)), var(--dh-frame-max-width, 400px));
      max-width: min(100%, var(--dh-glass-max-width, 1000px));
      aspect-ratio: var(--dh-frame-ar, 1);
      container-type: inline-size;
      position: relative;
      z-index: 1;
      flex: 0 0 auto;
      margin-left: var(--dh-frame-ml, 0);
      margin-right: var(--dh-frame-mr, 0);
    }

    .dh-scene {
      position: absolute;
      inset: 0;
      box-sizing: border-box;
      padding: var(--dh-pad-top, 40px) var(--dh-pad-right, 14px) var(--dh-pad-bottom, 16px) var(--dh-pad-left, 14px);
      overflow: visible;
    }

    .dh-device {
      position: relative;
      width: min(95cqmin, var(--dh-frame-max-width, 400px));
      height: min(95cqmin, var(--dh-frame-max-width, 400px));
      margin: 0 auto;
      transform: translate(var(--dh-offset-x, 0px), var(--dh-offset-y, 0px));
      container-type: inline-size;
    }

    .dh-frame.align-left .dh-device { margin-left: 0; margin-right: auto; }
    .dh-frame.align-center .dh-device { margin-left: auto; margin-right: auto; }
    .dh-frame.align-right .dh-device { margin-left: auto; margin-right: 0; }

    .dh-limit-layer {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      pointer-events: none;
    }

    .dh-limit-layer > * {
      pointer-events: auto;
      max-width: 100% !important;
    }

    .dh-limit-arc { max-width: var(--dh-frame-max-width, 1000px); z-index: 10; }
    .dh-limit-target { z-index: 20; max-width: var(--dh-hum-panel-max, 240px); }
    .dh-limit-bottom { z-index: 25; max-width: var(--dh-controls-max, 520px); }
    .dh-limit-current { z-index: 5; max-width: var(--dh-cur-max, 400px); }

    .dh-cog-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.4);
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      cursor: pointer;
    }

    .dh-cog-btn:hover {
      background: rgba(0,0,0,0.5);
      color: rgba(255,255,255,0.9);
      transform: scale(1.05);
    }

    .dh-cog-btn ha-icon {
      --mdc-icon-size: 20px;
    }
  `;

  static getConfigElement() {
    return document.createElement('smart-dehumidifier-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:smart-dehumidifier',
      entity: '',
      fan_entity: '',
    };
  }

  constructor() {
    super();
    this._config = null;
    this._hass = null;

    this._timerInterval = null;
    this._trackedEntityIds = [];

    this._targetHumidity = null;
    this._ignoreStateUntil = 0;

    this._dragging = false;
    this._isSettingsOpen = false;
    this._humPanelAutoPopupOpen = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._syncTicker();
  }

  disconnectedCallback() {
    this._stopTicker();
    super.disconnectedCallback();
  }

  setConfig(config) {
    if (config.arc_radius === undefined) config = { ...config, arc_radius: 150 };
    if (!config.language && !config.lang) {
      let lang = 'uk';
      try {
        const stored = localStorage.getItem('sd_card_lang');
        if (stored) lang = stored;
      } catch (_e) {}
      config = { ...config, language: lang };
    }
    if (!config || typeof config !== 'object') {
      throw new Error('Невалідна конфігурація картки');
    }

    let merged = {
      type: 'custom:smart-dehumidifier',
      ...config,
    };

    // Hard-bind integration helpers (delta/min/max/timers/status/auto/…)
    if (this._hass) {
      merged = { ...merged, ...resolveSdEntities(this._hass, merged) };
    }

    this._config = merged;
    this._trackedEntityIds = extractTrackedEntities(this._config);
    this._syncTicker();
  }

  static getConfigForm() {
    return {
      schema: [
        {
          name: 'entity',
          required: true,
          selector: { entity: { domain: 'humidifier' } },
        },
        {
          name: 'fan_entity',
          selector: { entity: { domain: ['switch', 'fan'] } },
        },
        {
          name: 'current_humidity_entity',
          selector: { entity: { domain: 'sensor' } },
        },
        {
          name: 'room_humidity_entity',
          selector: { entity: { domain: 'sensor' } },
        },
      ],
      computeLabel: (schema) => {
        const labels = {
          entity: 'Осушувач',
          fan_entity: 'Вентилятор',
          current_humidity_entity: 'Вологість у ванній',
          room_humidity_entity: 'Вологість у кімнаті',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  _isFanRunning(hass = this._hass) {
    const fanEntity = this._config?.fan_entity;
    if (!fanEntity || !hass?.states) return false;
    return hass.states[fanEntity]?.state === 'on';
  }

  set hass(hass) {
    const oldHass = this._hass;
    if (hass && this._config?.entity) {
      const resolved = resolveSdEntities(hass, this._config);
      this._config = { ...this._config, ...resolved };
      this._trackedEntityIds = extractTrackedEntities(this._config);
    }
    const oldFanOn = this._isFanRunning(oldHass);

    this._hass = hass;

    const newFanOn = this._isFanRunning(hass);
    if (oldFanOn !== newFanOn) {
      this._syncTicker();
    }

    this.requestUpdate('_hass', oldHass);
  }

  get hass() {
    return this._hass;
  }

  updated(changedProps) {
    if (changedProps.has('_config')) {
      this._trackedEntityIds = extractTrackedEntities(this._config || {});
      this._syncTicker();
    }
  }

  shouldUpdate(changedProps) {
    if (
      changedProps.has('_config') ||
      changedProps.has('_targetHumidity') ||
      changedProps.has('_isSettingsOpen') ||
      changedProps.has('_humPanelAutoPopupOpen')
    ) {
      return true;
    }

    if (changedProps.has('_hass')) {
      const prevHass = changedProps.get('_hass');
      return hasTrackedEntityChange(prevHass, this._hass, this._trackedEntityIds);
    }

    return true;
  }

  _shouldRunTicker() {
    return this.isConnected && this._isFanRunning();
  }// --- ВОТ ЭТА ФУНКЦИЯ БЫЛА ПРОПУЩЕНА ---
  _syncTicker() {
    if (this._shouldRunTicker()) this._startTicker();
    else this._stopTicker();
  }

  _startTicker() {
    if (this._timerInterval !== null) return;
    this._timerInterval = window.setInterval(() => {
      this._updateTimerDOM();
    }, TICK_MS);
  }

  _stopTicker() {
    if (this._timerInterval === null) return;
    clearInterval(this._timerInterval);
    this._timerInterval = null;
  }

  // Оновлення таймера безпосередньо в DOM (БЕЗ крашу LitElement)
  _updateTimerDOM() {
    if (!this.shadowRoot) return;
    
    const timerEl = this.shadowRoot.querySelector('.dh-timer-text');
    if (!timerEl) return;

    const fanEntity = this._config?.fan_entity;
    if (!fanEntity || !this._hass?.states?.[fanEntity]) return;

    const stateObj = this._hass.states[fanEntity];
    if (stateObj.state !== 'on') return;

    const newText = formatElapsedSince(stateObj.last_changed);
    if (!newText) return;
    
    // LitElement залишає коментарі-маркери всередині елемента.
    // Властивість .textContent знищує їх і ламає картку при наступному рендері.
    // Змінюємо ЛИШЕ текстовий вузол (nodeType === 3):
    for (const node of timerEl.childNodes) {
      if (node.nodeType === 3) {
        if (node.nodeValue !== newText) {
          node.nodeValue = newText;
        }
        return; // Оновили — виходимо
      }
    }
  }

  _getLayoutData() {
    const config = this._config || {};

    const borderRadius = Math.max(0, toFiniteNumber(config.card_border_radius, DEFAULT_BORDER_RADIUS));
    const glassMaxWidth = toPositiveNumber(config.glass_max_width, 1000);
    const layoutBaseWidth = toPositiveNumber(config.layout_base_width, 600);
    const humPanelMax = toPositiveNumber(
      config.hum_panel_max_width,
      toPositiveNumber(config.hum_panel_width, 240)
    );
    const controlsMax = toPositiveNumber(config.controls_max_width, 520);
    const curMax = toPositiveNumber(config.cur_max_width, 400);
    const heightPercent = toPositiveNumber(config.card_height_percent, DEFAULT_HEIGHT_PERCENT);
    const frameRatioNum = 100 / heightPercent;
    const glassRatio = toPositiveNumber(config.glass_aspect_ratio, 1.8);
    const align = normalizeAlign(config.alignment);

    let justifyContent = 'center';
    if (align === 'left') justifyContent = 'flex-start';
    if (align === 'right') justifyContent = 'flex-end';

    return {
      borderRadius,
      glassMaxWidth,
      layoutBaseWidth,
      humPanelMax,
      controlsMax,
      curMax,
      frameRatioNum,
      frameRatio: `100 / ${heightPercent}`,
      glassRatio: String(glassRatio),
      alignClass: `align-${align}`,
      justifyContent,
      frameMl: align === 'right' ? 'auto' : '0',
      frameMr: align === 'left' ? 'auto' : (align === 'center' ? 'auto' : '0'),
      padTop: `${toFiniteNumber(config.content_padding_top, 40)}px`,
      padBottom: `${toFiniteNumber(config.content_padding_bottom, 16)}px`,
      padLeft: `${toFiniteNumber(config.content_padding_left, 14)}px`,
      padRight: `${toFiniteNumber(config.content_padding_right, 14)}px`,
      offsetX: `${toFiniteNumber(config.device_offset_x, 0)}px`,
      offsetY: `${toFiniteNumber(config.device_offset_y, 0)}px`,
    };
  }

  _renderSceneContent() {
    const config = this._config;
    const renderConfig = { ...config, layout_base_width: 400 };

    return html`
      ${renderVisualEffects(this, renderConfig)}

      <div class="dh-limit-layer dh-limit-arc">
        ${(config.show_arc ?? true) ? renderArcSlider(this, renderConfig) : null}
      </div>

      <div class="dh-limit-layer dh-limit-current">
        ${renderCurrentHumidity(this, renderConfig)}
      </div>

      <div class="dh-limit-layer dh-limit-target">
        ${renderHumidityPanel(this, renderConfig)}
      </div>

      <div class="dh-limit-layer dh-limit-bottom">
        ${renderBottomControls(this, renderConfig)}
      </div>
    `;
  }

  render() {
    if (!this._config || !this._hass) return html``;

    const layout = this._getLayoutData();

    const cardStyle = `
      --dh-card-radius: ${layout.borderRadius}px;
      --dh-glass-max-width: ${layout.glassMaxWidth}px;
      --dh-glass-ar-mobile: ${layout.frameRatio};
      --dh-glass-ar-wide: ${layout.glassRatio};
      --dh-justify: ${layout.justifyContent};
    `;

    const frameStyle = `
      --dh-frame-max-width: ${layout.layoutBaseWidth}px;
      --dh-frame-ar-num: ${layout.frameRatioNum};
      --dh-frame-ar: ${layout.frameRatio};
      --dh-hum-panel-max: ${layout.humPanelMax}px;
      --dh-controls-max: ${layout.controlsMax}px;
      --dh-cur-max: ${layout.curMax}px;
      --dh-pad-top: ${layout.padTop};
      --dh-pad-bottom: ${layout.padBottom};
      --dh-pad-left: ${layout.padLeft};
      --dh-pad-right: ${layout.padRight};
      --dh-offset-x: ${layout.offsetX};
      --dh-offset-y: ${layout.offsetY};
      --dh-frame-ml: ${layout.frameMl};
      --dh-frame-mr: ${layout.frameMr};
    `;

    return html`
      <ha-card class="${this._isSettingsOpen ? 'dh-settings-open' : ''}" style="${cardStyle}">
        <div class="dh-card-bg" aria-hidden="true">
          <div class="dh-card-bg__base"></div>
          <div class="dh-card-bg__vignette"></div>
          <div class="dh-card-bg__glass-curve"></div>
          <div class="dh-card-bg__specular"></div>
          <div class="dh-card-bg__noise"></div>
          <div class="dh-card-bg__top-line"></div>
          <div class="dh-card-bg__edge"></div>
        </div>

        <button class="dh-cog-btn" @click=${() => { this._isSettingsOpen = true; this.requestUpdate(); }}>
          <ha-icon icon="mdi:cog"></ha-icon>
        </button>

        <div class="dh-frame ${layout.alignClass}" style="${frameStyle}">
          <div class="dh-scene">
            <div class="dh-device">
              ${this._renderSceneContent()}
            </div>
          </div>
        </div>

        ${renderSettingsPanel(this, this._config)}
      </ha-card>
    `;
  }
}

if (!customElements.get('smart-dehumidifier')) {
  customElements.define('smart-dehumidifier', MyDehumidifierCard);
}

export { MyDehumidifierCard };

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'smart-dehumidifier')) {
  window.customCards.push({
    type: 'smart-dehumidifier',
    name: 'Smart Dehumidifier',
    description: 'Преміум картка осушувача з візуальним редактором',
    preview: true,
    documentationURL: 'https://github.com/kdinya/Smart-Dehumidifier',
  });
}
