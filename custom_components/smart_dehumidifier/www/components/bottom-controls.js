import { html } from '../files/lit-proxy.js?v=1.6.6';

import {
  toFiniteNumber,
  toPositiveNumber,
  layoutUnit,
  getEntityState,
  isEntityOn,
  isMainEntityOn,
  callHA,
  formatElapsedSince,
  DEFAULT_LAYOUT_BASE_WIDTH,
  DEFAULT_CONTROLS_MAX_WIDTH,
} from '../dh-utils.js?v=1.6.6';

const STATUS_MAP = {
  off: {
    label: 'Вимкнено',
    color: 'rgba(255,77,77,0.85)',
    manualActive: false,
  },
  idle: {
    label: 'Очікування',
    color: '#ffb84d',
    manualActive: false,
  },
  manual: {
    label: 'Ручний',
    color: '#ffc600',
    manualActive: true,
  },
  drying: {
    label: 'Авто',
    color: 'var(--state-humidifier-color, #00bfff)',
    manualActive: false,
  },
  drying_manual: {
    label: 'Авто/Ручний',
    color: '#7ee7ff',
    manualActive: true,
  },
  pause: {
    label: 'Пауза',
    color: '#a0a0a0',
    manualActive: false,
  },
  unknown: {
    label: 'Невідомо',
    color: 'rgba(255,255,255,0.45)',
    manualActive: false,
  },
};

function getStatusData(card, config) {
  const entityId = config.status_entity;
  const labelEntityId = entityId + '_label'; // Шукаємо сенсор із текстом

  const stateObj = getEntityState(card, entityId);
  const labelObj = getEntityState(card, labelEntityId);

  const rawState = String(stateObj?.state ?? 'unknown').trim().toLowerCase();
  const mapped = STATUS_MAP[rawState] || STATUS_MAP.unknown;

  // Якщо є _label сенсор — беремо його стан. Якщо ні — беремо резервну назву з мапи
  const displayLabel = labelObj ? labelObj.state : mapped.label;

  return {
    state: rawState,
    label: displayLabel,
    color: mapped.color,
    manualActive: mapped.manualActive,
  };
}

function getControlState(card, config) {
  const status = getStatusData(card, config);

  return {
    mainOn: isMainEntityOn(card, config?.entity),
    fanOn: isEntityOn(card, config?.fan_entity),
    manualActive: status.manualActive,
    status,
  };
}

function getManualScriptEntity(config) {
  return config.manual_script_entity;
}

function handlePower(card, config, action, state) {
  switch (action) {
    case 'off': {
      if (state.mainOn && config?.entity) {
        callHA(card, 'homeassistant', 'turn_off', {
          entity_id: config.entity,
        });
      }

      if (state.fanOn && config?.fan_entity) {
        callHA(card, 'switch', 'turn_off', {
          entity_id: config.fan_entity,
        });
      }

      break;
    }

    case 'on': {
      if (!state.mainOn && config?.entity) {
        callHA(card, 'homeassistant', 'turn_on', {
          entity_id: config.entity,
        });
      }

      break;
    }

    case 'manual': {
      const scriptEntity = getManualScriptEntity(config);
      if (!scriptEntity) return;
      const domain = String(scriptEntity).split('.')[0];
      if (domain === 'button') {
        callHA(card, 'button', 'press', { entity_id: scriptEntity });
      } else if (domain === 'script') {
        callHA(card, 'script', 'turn_on', { entity_id: scriptEntity });
      } else {
        // fallback service on integration
        callHA(card, 'smart_dehumidifier', 'manual_toggle', {});
      }
      break;
    }

    default:
      break;
  }
}

function getRuntimeText(card, config) {
  const fanEntity = config?.fan_entity;
  if (!fanEntity) return null;

  const stateObj = getEntityState(card, fanEntity);
  if (!stateObj || stateObj.state !== 'on') return null;

  return formatElapsedSince(stateObj.last_changed);
}

export function renderBottomControls(card, config = {}) {
  if (config.show_btns === false) return html``;

  const layoutBaseWidth = toPositiveNumber(
    config.layout_base_width,
    DEFAULT_LAYOUT_BASE_WIDTH
  );
  const controlsMaxWidth = toPositiveNumber(
    config.controls_max_width,
    DEFAULT_CONTROLS_MAX_WIDTH
  );

  const state = getControlState(card, config);
  const { mainOn, manualActive, status } = state;

  const timerText = getRuntimeText(card, config);

  const btnHeight = toPositiveNumber(config.btn_height, 54);
  const btnOffColor = config.btn_off_color ?? 'var(--error-color, #ff4d4d)';
  const btnOnColor =
    config.btn_on_color ?? 'var(--state-humidifier-color, #00bfff)';
  const btnManualColor =
    config.btn_manual_color ?? 'var(--warning-color, #FFD700)';

  const badgeWidth = toPositiveNumber(config.badge_width, 92);
  const badgeHeight = toPositiveNumber(config.badge_height, 22);
  const badgeRadius = toFiniteNumber(config.badge_radius, 6);
  const badgeSize = toPositiveNumber(config.badge_size, 9.5);
  const badgeFontWeight = toFiniteNumber(config.badge_font_weight, 900);
  const badgeBgColor = config.badge_bg_color ?? '#06080b';

  const btnsBottom = toFiniteNumber(config.btns_bottom, 14);
  const badgeOffsetY = toFiniteNumber(config.badge_offset_y, 0);

  const btnLabelSize = toPositiveNumber(config.btn_label_size, 8);
  const fanTextSize = toPositiveNumber(config.fan_text_size, 15);
  const btnIconSize = toPositiveNumber(config.btn_icon_size, 18);

  const widthCss = layoutUnit(controlsMaxWidth, layoutBaseWidth);
  const btnHeightCss = layoutUnit(btnHeight, layoutBaseWidth);

  const offLabel = config.btn_off_label ?? 'OFF';
  const onLabel = config.btn_on_label ?? 'ON';
  const manualLabel = config.btn_manual_label ?? 'MANUAL';

  const offIcon = config.btn_off_icon ?? 'mdi:power-cycle';
  const onIcon = config.btn_on_icon ?? 'mdi:fan';
  const manualIcon = config.btn_manual_icon ?? 'mdi:gesture-tap';

  return html`
    <style>
      @keyframes dh-fan-spin {
        100% { transform: rotate(360deg); }
      }

      .dh-bottom-wrap {
        position: absolute;
        left: 50%;
        bottom: ${layoutUnit(btnsBottom, layoutBaseWidth)};
        transform: translateX(-50%);
        width: min(${widthCss}, 100cqw);
        z-index: 16;
        pointer-events: auto;
        display: flex;
        justify-content: center;
      }

      .dh-hill-group {
        width: 100%;
        height: ${btnHeightCss};
        display: flex;
        box-sizing: border-box;
        overflow: hidden;
        padding: ${layoutUnit(2, layoutBaseWidth)};
        background: #090b0e;
        box-shadow:
          0 10px 20px rgba(0,0,0,0.5),
          0 0 0 1px rgba(0,0,0,0.8);
        border-radius: ${layoutUnit(btnHeight * 2.5, layoutBaseWidth)} /
          ${layoutUnit(btnHeight / 2, layoutBaseWidth)};
      }

      .dh-hill-btn {
        position: relative;
        flex: 1;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        color: rgba(255,255,255,0.4);
        background: linear-gradient(180deg, #2a303a 0%, #161a20 100%);
        box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
        transition: background 0.2s, color 0.2s;
      }

      .dh-hill-btn:first-child {
        border-radius:
          ${layoutUnit(btnHeight * 1.2, layoutBaseWidth)} 0 0
          ${layoutUnit(btnHeight * 1.2, layoutBaseWidth)} /
          ${layoutUnit(btnHeight / 2, layoutBaseWidth)} 0 0
          ${layoutUnit(btnHeight / 2, layoutBaseWidth)};
      }

      .dh-hill-btn:last-child {
        border-radius:
          0 ${layoutUnit(btnHeight * 1.2, layoutBaseWidth)}
          ${layoutUnit(btnHeight * 1.2, layoutBaseWidth)} 0 /
          0 ${layoutUnit(btnHeight / 2, layoutBaseWidth)}
          ${layoutUnit(btnHeight / 2, layoutBaseWidth)} 0;
      }

      .dh-hill-btn.active {
        background: linear-gradient(180deg, #1a2028 0%, #12151a 100%);
      }

      .dh-btn-center {
        flex: 2;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding:
          ${layoutUnit(5, layoutBaseWidth)} 0
          ${layoutUnit(4, layoutBaseWidth)};
        border-left: 2px solid #090b0e;
        border-right: 2px solid #090b0e;
      }

      .dh-hill-label {
        font-size: ${layoutUnit(btnLabelSize, layoutBaseWidth)};
        font-weight: 700;
        text-transform: uppercase;
        line-height: 1;
      }

      .dh-main-lit {
        color: ${btnOnColor} !important;
        text-shadow: 0 0 10px ${btnOnColor};
      }

      .dh-main-lit-icon {
        color: ${btnOnColor} !important;
        filter: drop-shadow(0 0 5px ${btnOnColor});
      }

      .dh-manual-lit {
        color: ${btnManualColor} !important;
        text-shadow: 0 0 10px ${btnManualColor};
      }

      .dh-manual-lit-icon {
        color: ${btnManualColor} !important;
        filter: drop-shadow(0 0 5px ${btnManualColor});
      }

      .dh-off-lit {
        color: ${btnOffColor} !important;
        text-shadow: 0 0 10px ${btnOffColor};
      }

      .dh-off-lit-icon {
        color: ${btnOffColor} !important;
        filter: drop-shadow(0 0 5px ${btnOffColor});
      }

      .dh-center-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        flex-shrink: 0;
      }

      .dh-timer-text {
        font-family: monospace;
        font-size: ${layoutUnit(fanTextSize, layoutBaseWidth)};
        font-weight: 900;
        color: ${btnOnColor};
        text-shadow: 0 0 10px ${btnOnColor};
      }

      .dh-icon-spin {
        animation: dh-fan-spin 1.5s linear infinite;
        color: ${btnOnColor} !important;
        filter: drop-shadow(0 0 5px ${btnOnColor});
      }

      .dh-status-badge {
        width: ${badgeWidth}%;
        height: ${layoutUnit(badgeHeight, layoutBaseWidth)};
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${badgeBgColor};
        border-radius: ${layoutUnit(badgeRadius, layoutBaseWidth)};
        font-size: ${layoutUnit(badgeSize, layoutBaseWidth)};
        font-weight: ${badgeFontWeight};
        text-transform: uppercase;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
        transform: translateY(${layoutUnit(badgeOffsetY, layoutBaseWidth)});
        letter-spacing: ${layoutUnit(0.4, layoutBaseWidth)};
      }

      ha-icon {
        --mdc-icon-size: ${layoutUnit(btnIconSize, layoutBaseWidth)};
      }
    </style>

    <div class="dh-bottom-wrap">
      <div class="dh-hill-group">
        <button
          class="dh-hill-btn ${!mainOn ? 'active' : ''}"
          type="button"
          @click=${() => handlePower(card, config, 'off', state)}
        >
          <ha-icon
            icon="${offIcon}"
            class="${!mainOn ? 'dh-off-lit-icon' : ''}"
          ></ha-icon>
          <span class="dh-hill-label ${!mainOn ? 'dh-off-lit' : ''}">
            ${offLabel}
          </span>
        </button>

        <button
          class="dh-hill-btn dh-btn-center ${mainOn ? 'active' : ''}"
          type="button"
          @click=${() => handlePower(card, config, 'on', state)}
        >
          <div class="dh-center-content">
            ${timerText
              ? html`
                  <ha-icon icon="${onIcon}" class="dh-icon-spin"></ha-icon>
                  <span class="dh-timer-text">${timerText}</span>
                `
              : html`
                  <ha-icon
                    icon="${onIcon}"
                    class="${mainOn ? 'dh-main-lit-icon' : ''}"
                  ></ha-icon>
                  <span class="dh-hill-label ${mainOn ? 'dh-main-lit' : ''}">
                    ${onLabel}
                  </span>
                `}
          </div>

          ${(config.show_badge ?? true)
            ? html`
                <div class="dh-status-badge" style="color:${status.color};">
                  ${status.label}
                </div>
              `
            : html``}
        </button>

        <button
          class="dh-hill-btn ${manualActive ? 'active' : ''}"
          type="button"
          @click=${() => handlePower(card, config, 'manual', state)}
        >
          <ha-icon
            icon="${manualIcon}"
            class="${manualActive ? 'dh-manual-lit-icon' : ''}"
          ></ha-icon>
          <span class="dh-hill-label ${manualActive ? 'dh-manual-lit' : ''}">
            ${manualLabel}
          </span>
        </button>
      </div>
    </div>
  `;
}
