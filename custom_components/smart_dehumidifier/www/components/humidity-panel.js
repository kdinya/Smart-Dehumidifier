import { t } from '../i18n.js?v=1.5.2';
import { html } from '../files/lit-proxy.js?v=1.5.2';

import {
  toFiniteNumber,
  toPositiveNumber,
  clamp,
  layoutUnit,
  getEntityState,
  readNumberState,
  callHA,
  isMainEntityOn,
  DEFAULT_LAYOUT_BASE_WIDTH,
  DEFAULT_CONTROLS_MAX_WIDTH,
} from '../dh-utils.js?v=1.5.2';

const PANEL_BASE_WIDTH = 240;
const DEFAULT_TARGET = 50;
const DEFAULT_AUTO_CLOSE_MS = 2200;

function panelUnit(value) {
  return `${(toFiniteNumber(value, 0) / PANEL_BASE_WIDTH) * 100}cqw`;
}

// РОЗУМНА СИНХРОНІЗАЦІЯ ЦІЛІ: Читає або з пам'яті (під час рухів), або з HA
function readTargetState(card, config, fallback = DEFAULT_TARGET) {
  // Якщо ми зараз тягнемо повзунок або чекаємо відповіді сервера (grace period 1.8s) - беремо локальне значення
  if (card._targetHumidity !== undefined && card._targetHumidity !== null && 
     (card._dragging || Date.now() < (card._ignoreStateUntil || 0))) {
    return {
      isOn: isMainEntityOn(card, config?.entity),
      targetHumidity: clamp(card._targetHumidity, 0, 100),
    };
  }

  // Інакше беремо реальні дані з сервера Home Assistant
  const stateObj = getEntityState(card, config?.entity);
  const attrs = stateObj?.attributes || {};
  let targetHumidity = fallback;

  if (attrs.target_humidity !== undefined) targetHumidity = attrs.target_humidity;
  else if (attrs.humidity !== undefined) targetHumidity = attrs.humidity;

  const finalTarget = clamp(targetHumidity, 0, 100);
  
  // Оновлюємо локальну пам'ять, щоб дуга та цифри були синхронними
  card._targetHumidity = finalTarget;

  return {
    isOn: isMainEntityOn(card, config?.entity),
    targetHumidity: finalTarget,
  };
}

function isAutoEnabled(card, config) {
  const entityId = config.auto_entity;
  return getEntityState(card, entityId)?.state === 'on';
}

function setAutoEnabled(card, config, enabled) {
  const entityId = config.auto_entity;
  callHA(card, 'input_boolean', enabled ? 'turn_on' : 'turn_off', {
    entity_id: entityId,
  });
}

function clearAutoPopupTimer(card) {
  if (!card._humPanelAutoCloseTimer) return;
  clearTimeout(card._humPanelAutoCloseTimer);
  card._humPanelAutoCloseTimer = null;
}

function hideAutoPopup(card) {
  clearAutoPopupTimer(card);
  if (!card._humPanelAutoPopupOpen) return;
  card._humPanelAutoPopupOpen = false;
  card.requestUpdate();
}

function scheduleAutoPopupClose(card, config) {
  clearAutoPopupTimer(card);

  const delay = toPositiveNumber(config.auto_ui_auto_close_ms, DEFAULT_AUTO_CLOSE_MS, 200);

  card._humPanelAutoCloseTimer = setTimeout(() => {
    card._humPanelAutoCloseTimer = null;

    if (!card._humPanelAutoPopupOpen) return;
    if (isAutoEnabled(card, config)) return;

    card._humPanelAutoPopupOpen = false;
    card.requestUpdate();
  }, delay);
}

function showAutoPopup(card, config) {
  card._humPanelAutoPopupOpen = true;
  card.requestUpdate();

  if (!isAutoEnabled(card, config)) {
    scheduleAutoPopupClose(card, config);
  } else {
    clearAutoPopupTimer(card);
  }
}

function disableAutoAndHide(card, config) {
  if (isAutoEnabled(card, config)) {
    setAutoEnabled(card, config, false);
  }
  hideAutoPopup(card);
}

function setTarget(card, config, value) {
  const nextValue = clamp(Math.round(value), 0, 100);
  if (!config?.entity) return;

  disableAutoAndHide(card, config);

  card._targetHumidity = nextValue;
  card._ignoreStateUntil = Date.now() + 1800; // Ігноруємо затримки сервера 1.8с
  card.requestUpdate();

  callHA(card, 'humidifier', 'set_humidity', {
    entity_id: config.entity,
    humidity: nextValue,
  });
}

function quickAdjustTarget(card, config, delta) {
  const current = readTargetState(card, config, DEFAULT_TARGET).targetHumidity;
  setTarget(card, config, current + delta);
}

function formatRecommendedHumidity(value) {
  if (!Number.isFinite(value)) return '--%';
  return `${Math.round(clamp(value, 0, 100))}%`;
}

function toggleAutoPopup(card, config) {
  if (card._humPanelAutoPopupOpen) {
    hideAutoPopup(card);
    return;
  }
  showAutoPopup(card, config);
}

function handleCenterClick(card, config) {
  const autoShow = config.auto_ui_show ?? true;
  if (!autoShow) return;

  if (isAutoEnabled(card, config)) {
    disableAutoAndHide(card, config);
    return;
  }

  if (card._humPanelAutoPopupOpen) {
    hideAutoPopup(card);
    return;
  }

  showAutoPopup(card, config);
}

function handleAutoButtonClick(card, config, autoEnabled) {
  if (autoEnabled) {
    disableAutoAndHide(card, config);
    return;
  }

  setAutoEnabled(card, config, true);
  
  // МИТТЄВИЙ СТРИБОК: Одразу переводимо цифри і повзунок на авто-рекомендацію
  const calcEntity = config.calc_entity;
  const recommendedRh = readNumberState(card, calcEntity);
  if (Number.isFinite(recommendedRh)) {
    card._targetHumidity = Math.round(clamp(recommendedRh, 0, 100));
    card._ignoreStateUntil = Date.now() + 1800;
  }

  card._humPanelAutoPopupOpen = true;
  clearAutoPopupTimer(card);
  card.requestUpdate();
}

export function renderHumidityPanel(card, config = {}) {
  if (config.show_hum_panel === false) return html``;

  const layoutBaseWidth = toPositiveNumber(config.layout_base_width, DEFAULT_LAYOUT_BASE_WIDTH);
  const controlsMaxWidth = toPositiveNumber(config.controls_max_width, DEFAULT_CONTROLS_MAX_WIDTH);

  const requestedPanelWidth = toPositiveNumber(config.hum_panel_width, PANEL_BASE_WIDTH);
  const panelWidth = Math.min(requestedPanelWidth, controlsMaxWidth);
  const panelHeight = toPositiveNumber(config.hum_panel_height, 54);
  const panelRadius = toFiniteNumber(config.hum_panel_radius, 28);
  const panelPaddingX = toFiniteNumber(config.hum_panel_padding_x, 5);

  const displayWidth = toPositiveNumber(config.hum_display_width, 90);
  const displayHeight = toPositiveNumber(config.hum_display_height, 42);
  const displayRadius = toFiniteNumber(config.hum_display_radius, 12);

  const humBtnSize = toPositiveNumber(config.hum_btn_size, 40);
  const humBtnFontSize = toPositiveNumber(config.hum_btn_font_size, 20);

  const tgtSize = toPositiveNumber(config.tgt_size, 32);
  const tgtFontFamily = config.tgt_font_family || 'inherit';
  const tgtFontWeight = toFiniteNumber(config.tgt_font_weight, 700);

  const normalTargetColor =
    config.arc_tgt_color_on ||
    config.tgt_color_on ||
    'var(--state-humidifier-color, #00bfff)';

  const tgtColorOff = config.tgt_color_off || 'rgba(255,255,255,0.28)';
  const tgtGlowOn = config.tgt_glow_on || '0 0 12px rgba(0,200,255,.5)';

  const showTgtLabel = config.show_tgt_label ?? false;
  const tgtLabelText = config.tgt_label_text || 'Ціль';
  const tgtLabelSize = toPositiveNumber(config.tgt_label_size, 9);
  const panelBottom = toFiniteNumber(config.hum_panel_bottom, 110);

  const autoShow = config.auto_ui_show ?? true;
  const autoAccentColor = config.auto_ui_color || '#7fc8ff';
  const autoPopupBg = config.auto_ui_popup_bg || 'linear-gradient(145deg, #2d3945 0%, #182029 100%)';
  const autoPopupBgActive = config.auto_ui_popup_bg_active || 'linear-gradient(145deg, #20394d 0%, #152433 100%)';
  const autoPopupIcon = config.auto_ui_icon || 'mdi:water-percent';
  const autoLabelText = config.auto_ui_label_text || t(card._hass, 'auto', config);

  const autoPopupX = toFiniteNumber(config.auto_ui_popup_x, 0);
  const autoPopupY = toFiniteNumber(config.auto_ui_popup_y, 92);
  const autoPopupWidth = toFiniteNumber(config.auto_ui_popup_width, 164);
  const autoPopupHeight = toFiniteNumber(config.auto_ui_popup_height, 40);
  const autoPopupRadius = toFiniteNumber(config.auto_ui_popup_radius, 20);
  const autoPopupIconSize = toFiniteNumber(config.auto_ui_icon_size, 18);
  const autoPopupLabelSize = toFiniteNumber(config.auto_ui_label_size, 13);
  const autoPopupValueSize = toFiniteNumber(config.auto_ui_value_size, 15);
  const autoPopupGap = toFiniteNumber(config.auto_ui_gap, 8);
  const autoPopupPaddingX = toFiniteNumber(config.auto_ui_padding_x, 14);

  const autoArrowX = toFiniteNumber(config.auto_ui_arrow_x, 0);
  const autoArrowY = toFiniteNumber(config.auto_ui_arrow_y, 0);
  const autoArrowWidth = toFiniteNumber(config.auto_ui_arrow_width, 20);
  const autoArrowHeight = toFiniteNumber(config.auto_ui_arrow_height, 12);
  const autoArrowIconSize = toFiniteNumber(config.auto_ui_arrow_icon_size, 13);
  const autoArrowRadius = toFiniteNumber(config.auto_ui_arrow_radius, 10);
  const autoArrowColor = config.auto_ui_arrow_color || 'rgba(255,255,255,0.56)';
  const autoArrowBg = config.auto_ui_arrow_bg || 'linear-gradient(180deg, rgba(56,64,76,0.95) 0%, rgba(26,31,38,0.95) 100%)';

  const autoPopupOpen = !!card._humPanelAutoPopupOpen;
  const autoEnabled = isAutoEnabled(card, config);

  const calcEntity = config.calc_entity;
  const recommendedRh = readNumberState(card, calcEntity);

  const stateData = readTargetState(card, config, DEFAULT_TARGET);
  const isOn = stateData.isOn;
  const targetValue = stateData.targetHumidity;

  const displayAutoValue = formatRecommendedHumidity(recommendedRh);

  const targetMainColor = autoEnabled
    ? autoAccentColor
    : (isOn ? normalTargetColor : tgtColorOff);

  const targetMainShadow = autoEnabled
    ? '0 0 12px rgba(127, 200, 255, 0.34)'
    : (isOn ? tgtGlowOn : 'none');

  const canRecommendAuto = Number.isFinite(recommendedRh);

  return html`
    <style>
      .dh-hum-stack {
        position: absolute;
        left: 50%;
        bottom: ${layoutUnit(panelBottom, layoutBaseWidth)};
        transform: translateX(-50%);
        width: min(${layoutUnit(panelWidth, layoutBaseWidth)}, 100cqw);
        aspect-ratio: ${panelWidth} / ${panelHeight};
        container-type: inline-size;
        z-index: 12;
        pointer-events: none;
        overflow: visible;
      }

      .dh-hum-panel {
        position: absolute;
        inset: 0;
        box-sizing: border-box;
        z-index: 2;
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 ${panelUnit(panelPaddingX)};
        border-radius: ${panelUnit(panelRadius)};
        background: linear-gradient(180deg, #1e2229 0%, #161a1f 100%);
        box-shadow:
          inset 0 ${panelUnit(2)} ${panelUnit(3)} rgba(255,255,255,0.1),
          inset 0 ${panelUnit(-5)} ${panelUnit(10)} rgba(0,0,0,0.6),
          0 ${panelUnit(10)} ${panelUnit(30)} rgba(0,0,0,0.5);
      }

      .dh-auto-popup-anchor {
        position: absolute;
        left: calc(50% + ${panelUnit(autoPopupX)});
        bottom: calc(100% + ${panelUnit(autoPopupY)});
        transform: translateX(-50%);
        z-index: 6;
        pointer-events: none;
        overflow: visible;
      }

      .dh-cyber-wrap {
        flex: 0 0 auto;
        position: relative;
        width: ${panelUnit(displayWidth)};
        height: ${panelUnit(displayHeight)};
        overflow: visible;
      }

      .dh-cyber-toggle {
        position: absolute;
        left: calc(50% + ${panelUnit(autoArrowX)});
        bottom: calc(100% + ${panelUnit(autoArrowY)});
        transform: translateX(-50%);
        width: ${panelUnit(autoArrowWidth)};
        height: ${panelUnit(autoArrowHeight)};
        min-width: ${panelUnit(autoArrowWidth)};
        min-height: ${panelUnit(autoArrowHeight)};
        border: none;
        padding: 0;
        box-sizing: border-box;
        border-radius: ${panelUnit(autoArrowRadius)};
        display: ${autoShow ? 'flex' : 'none'};
        align-items: center;
        justify-content: center;
        cursor: pointer;
        pointer-events: auto;
        color: ${autoEnabled ? autoAccentColor : (autoPopupOpen ? autoAccentColor : autoArrowColor)};
        background: ${autoArrowBg};
        box-shadow:
          0 0 0 ${panelUnit(1.2)} #0f1318,
          0 ${panelUnit(4)} ${panelUnit(8)} rgba(0,0,0,0.34),
          inset 0 ${panelUnit(1)} ${panelUnit(1)} rgba(255,255,255,0.12);
      }

      .dh-cyber-toggle ha-icon {
        --mdc-icon-size: ${panelUnit(autoArrowIconSize)};
      }

      .dh-auto-popup {
        width: ${panelUnit(autoPopupWidth)};
        height: ${panelUnit(autoPopupHeight)};
        min-width: ${panelUnit(autoPopupWidth)};
        min-height: ${panelUnit(autoPopupHeight)};
        padding: 0 ${panelUnit(autoPopupPaddingX)};
        box-sizing: border-box;
        border: none;
        border-radius: ${panelUnit(autoPopupRadius)};
        display: flex;
        align-items: center;
        justify-content: center;
        gap: ${panelUnit(autoPopupGap)};
        cursor: pointer;
        pointer-events: ${(autoPopupOpen || autoEnabled) ? 'auto' : 'none'};
        opacity: ${(autoPopupOpen || autoEnabled) ? 1 : 0};
        color: ${autoEnabled ? autoAccentColor : 'rgba(255,255,255,0.76)'};
        background: ${autoEnabled ? autoPopupBgActive : autoPopupBg};
        box-shadow:
          0 0 0 ${panelUnit(2)} #0f1318,
          0 ${panelUnit(7)} ${panelUnit(14)} rgba(0,0,0,0.42),
          inset 0 ${panelUnit(2)} ${panelUnit(2)} rgba(255,255,255,0.12),
          inset 0 ${panelUnit(-2)} ${panelUnit(4)} rgba(0,0,0,0.35);
        transition: opacity 0.22s ease, transform 0.22s ease, color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
        transform: scale(${(autoPopupOpen || autoEnabled) ? 1 : 0.92});
      }

      .dh-auto-popup.is-disabled-value {
        color: rgba(255,255,255,0.45);
      }

      .dh-auto-popup ha-icon {
        --mdc-icon-size: ${panelUnit(autoPopupIconSize)};
        flex: 0 0 auto;
      }

      .dh-auto-popup-label {
        font-size: ${panelUnit(autoPopupLabelSize)};
        font-weight: 700;
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: ${panelUnit(0.4)};
        flex: 0 0 auto;
      }

      .dh-auto-popup-value {
        font-size: ${panelUnit(autoPopupValueSize)};
        font-weight: 800;
        line-height: 1;
        flex: 0 0 auto;
      }

      .dh-cyber-display {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: none;
        outline: none;
        padding: 0;
        appearance: none;
        -webkit-appearance: none;
        border-radius: ${panelUnit(displayRadius)};
        background: #090c10;
        box-shadow: inset 0 0 ${panelUnit(12)} rgba(0,0,0,0.9);
        cursor: pointer;
        pointer-events: auto;
      }

      .dh-cyber-val {
        font-family: ${tgtFontFamily};
        font-size: ${panelUnit(tgtSize)};
        font-weight: ${tgtFontWeight};
        line-height: 1;
        color: ${targetMainColor};
        text-shadow: ${targetMainShadow};
        transition: color 0.22s ease, text-shadow 0.22s ease;
      }

      .dh-cyber-label {
        margin-top: ${panelUnit(2)};
        font-size: ${panelUnit(tgtLabelSize)};
        line-height: 1;
        color: ${autoEnabled ? autoAccentColor : 'rgba(255,255,255,0.35)'};
        text-transform: uppercase;
        letter-spacing: ${panelUnit(1.2)};
        transition: color 0.22s ease;
      }

      .dh-luxury-btn {
        flex: 0 0 auto;
        width: ${panelUnit(humBtnSize)};
        height: ${panelUnit(humBtnSize)};
        min-width: ${panelUnit(humBtnSize)};
        min-height: ${panelUnit(humBtnSize)};
        aspect-ratio: 1 / 1;
        box-sizing: border-box;
        padding: 0;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        pointer-events: auto;
        background: linear-gradient(145deg, #323945 0%, #1e232a 100%);
        color: rgba(255,255,255,0.5);
        box-shadow:
          0 0 0 ${panelUnit(2)} #0f1318,
          0 ${panelUnit(6)} ${panelUnit(12)} rgba(0,0,0,0.5),
          inset 0 ${panelUnit(2)} ${panelUnit(2)} rgba(255,255,255,0.15),
          inset 0 ${panelUnit(-2)} ${panelUnit(4)} rgba(0,0,0,0.4);
      }

      .dh-luxury-btn ha-icon {
        --mdc-icon-size: ${panelUnit(humBtnFontSize)};
      }
    </style>

    ${autoShow ? html`
      <div class="dh-auto-popup-anchor">
        <button
          class="dh-auto-popup ${!canRecommendAuto ? 'is-disabled-value' : ''}"
          type="button"
          aria-label="Авторежим"
          aria-pressed="${autoEnabled ? 'true' : 'false'}"
          @click=${() => handleAutoButtonClick(card, config, autoEnabled)}
        >
          <ha-icon icon="${autoPopupIcon}"></ha-icon>
          <span class="dh-auto-popup-label">${autoLabelText}</span>
          <span class="dh-auto-popup-value">${displayAutoValue}</span>
        </button>
      </div>
    ` : html``}

    <div class="dh-hum-stack">
      <div class="dh-hum-panel">
        <button class="dh-luxury-btn" type="button" aria-label="Зменшити цільову вологість" @click=${() => quickAdjustTarget(card, config, -1)}>
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>

        <div class="dh-cyber-wrap">
          ${autoShow ? html`
            <button class="dh-cyber-toggle" type="button" aria-label="Показати панель авто" @click=${() => toggleAutoPopup(card, config)}>
              <ha-icon icon="${autoPopupOpen ? 'mdi:chevron-down' : 'mdi:chevron-up'}"></ha-icon>
            </button>
          ` : html``}

          <button class="dh-cyber-display" type="button" aria-label="Показати панель авто" @click=${() => handleCenterClick(card, config)}>
            <span class="dh-cyber-val">${targetValue}%</span>
            ${showTgtLabel ? html`<span class="dh-cyber-label">${tgtLabelText}</span>` : html``}
          </button>
        </div>

        <button class="dh-luxury-btn" type="button" aria-label="Збільшити цільову вологість" @click=${() => quickAdjustTarget(card, config, 1)}>
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </div>
    </div>
  `;
}