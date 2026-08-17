import { html } from '../files/lit-proxy.js';

import {
  toFiniteNumber,
  toPositiveNumber,
  layoutUnit,
  isMainEntityOn,
  readCurrentHumidity,
  DEFAULT_LAYOUT_BASE_WIDTH,
} from '../dh-utils.js';

// Глобальне завантаження локального шрифту (обхід ізоляції Shadow DOM)
// Шлях my-dehumidifier/fonts у папці www відповідає /local/my-dehumidifier/fonts
if (!document.getElementById('dh-local-7seg-font')) {
  const fontStyle = document.createElement('style');
  fontStyle.id = 'dh-local-7seg-font';
  fontStyle.innerHTML = `
    @font-face {
      font-family: '7segment';
      src: url('/local/my-dehumidifier/fonts/7segment.woff') format('woff');
      font-weight: normal;
      font-style: normal;
    }
  `;
  document.head.appendChild(fontStyle);
}

const DEFAULT_HUMIDITY = 50;

function splitHumidity(value) {
  const rounded = Math.round(toFiniteNumber(value, DEFAULT_HUMIDITY) * 10);
  const intPart = Math.trunc(rounded / 10);
  const decPart = Math.abs(rounded % 10);

  return {
    intText: String(intPart),
    decText: String(decPart),
    hasDecimal: decPart !== 0,
  };
}

function getHumidityInfoEntity(config = {}) {
  return (
    config.current_humidity_entity ||
    config.current_entity ||
    config.humidity_entity ||
    null
  );
}

function openMoreInfo(card, entityId) {
  if (!entityId) return;

  card.dispatchEvent(
    new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId },
    })
  );
}

export function renderCurrentHumidity(card, config = {}) {
  if (!(config.show_current ?? true)) return html``;

  const layoutBaseWidth = toPositiveNumber(
    config.layout_base_width,
    DEFAULT_LAYOUT_BASE_WIDTH
  );

  const isOn = isMainEntityOn(card, config.entity);
  const currentHumidity = readCurrentHumidity(card, config, DEFAULT_HUMIDITY);
  const value = splitHumidity(currentHumidity);
  const infoEntityId = getHumidityInfoEntity(config);

  const curFontFamily = config.cur_font_family ?? "'7segment', monospace";

  const curSize = toFiniteNumber(config.cur_size, 90);
  const curDecSize = toFiniteNumber(config.cur_dec_size, 60);
  const curUnitSize = toFiniteNumber(config.cur_unit_size, 50);

  const curColorOn = config.cur_color_on ?? 'white';
  const curColorOff = config.cur_color_off ?? 'rgba(255,255,255,0.38)';
  const curDecColorOn = config.cur_dec_color_on ?? curColorOn;
  const curDecColorOff = config.cur_dec_color_off ?? curColorOff;
  const curUnitColorOn = config.cur_unit_color_on ?? 'rgba(255,255,255,0.60)';
  const curUnitColorOff = config.cur_unit_color_off ?? 'rgba(255,255,255,0.26)';

  // Складна тінь для імітації фізичного індикатора (тільки фаски та легке біле світіння)
  const curGlowOn = config.cur_glow_on ?? 
    '-1px -1px 1px rgba(255,255,255,0.4), ' +
    '1px 1px 1px rgba(0,0,0,0.6), ' +          
    '0 0 10px rgba(255,255,255,0.4)';           

  const curFontWeight = toFiniteNumber(config.cur_font_weight, 500);
  const curUnitWeight = toFiniteNumber(config.cur_unit_weight, 300);

  const curLetterSpacing = toFiniteNumber(config.cur_letter_spacing, -2);
  const curGap = toFiniteNumber(config.cur_gap, 3);
  const curUnitMarginLeft = toFiniteNumber(config.cur_unit_margin_left, 2);
  const curOffsetY = toFiniteNumber(config.cur_offset_y, 10);

  const curShowDecimal = config.cur_show_decimal ?? true;
  const curShowUnit = config.cur_show_unit ?? true;

  const mainColor = isOn ? curColorOn : curColorOff;
  const decColor = isOn ? curDecColorOn : curDecColorOff;
  const unitColor = isOn ? curUnitColorOn : curUnitColorOff;
  const mainShadow = isOn ? curGlowOn : 'none';
  const unitShadow = isOn ? '0 0 10px rgba(255,255,255,0.15)' : 'none';

  return html`
    <style>
      .dh-cur-layer {
        position: absolute;
        inset: 0;
        z-index: 18;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dh-cur-wrap {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translateY(${layoutUnit(curOffsetY, layoutBaseWidth)});
        pointer-events: auto;
      }

      .dh-cur-button {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: baseline;
        gap: ${layoutUnit(curGap, layoutBaseWidth)};
        line-height: 1;
        border: none;
        background: transparent;
        padding: 0;
        margin: 0;
        cursor: ${infoEntityId ? 'pointer' : 'default'};
        pointer-events: auto;
        -webkit-tap-highlight-color: transparent;
      }

      .dh-cur-button:focus-visible {
        outline: none;
        filter: drop-shadow(0 0 8px rgba(255,255,255,0.35));
      }

      .dh-cur-int,
      .dh-cur-dec {
        font-family: ${curFontFamily};
        font-weight: ${curFontWeight};
      }

      .dh-cur-int {
        font-size: ${layoutUnit(curSize, layoutBaseWidth)};
        letter-spacing: ${layoutUnit(curLetterSpacing, layoutBaseWidth)};
        color: ${mainColor};
        text-shadow: ${mainShadow};
        filter: drop-shadow(0 2px 10px rgba(0,0,0,0.35));
      }

      .dh-cur-dec {
        font-size: ${layoutUnit(curDecSize, layoutBaseWidth)};
        color: ${decColor};
        text-shadow: ${mainShadow};
      }

      .dh-cur-unit {
        font-size: ${layoutUnit(curUnitSize, layoutBaseWidth)};
        font-weight: ${curUnitWeight};
        color: ${unitColor};
        margin-left: ${layoutUnit(curUnitMarginLeft, layoutBaseWidth)};
        text-shadow: ${unitShadow};
      }
    </style>

    <div class="dh-cur-layer">
      <div class="dh-cur-wrap">
        <button
          class="dh-cur-button"
          type="button"
          title="${infoEntityId ? 'Показати властивості датчика' : ''}"
          @pointerdown=${(e) => e.stopPropagation()}
          @click=${(e) => {
            e.stopPropagation();
            openMoreInfo(card, infoEntityId);
          }}
        >
          <span class="dh-cur-int">${value.intText}</span>

          ${curShowDecimal && value.hasDecimal
            ? html`<span class="dh-cur-dec">.${value.decText}</span>`
            : html``}

          ${curShowUnit
            ? html`<span class="dh-cur-unit">%</span>`
            : html``}
        </button>
      </div>
    </div>
  `;
}