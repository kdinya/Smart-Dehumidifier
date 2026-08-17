import { html } from '../files/lit-proxy.js';

import {
  clamp,
  readHumidityTarget,
  readCurrentHumidity,
  isMainEntityOn,
  TARGET_SYNC_GRACE_MS,
} from '../dh-utils.js';

const SVG_W = 320;
const SVG_H = 310;
const CX = 160;
const CY = 165;
const FRAME_MS = 33;

function normalizeAngle(deg) {
  return ((deg % 360) + 360) % 360;
}

function clockwiseDistance(fromDeg, toDeg) {
  return normalizeAngle(toDeg - fromDeg);
}

function polar(deg, cx = CX, cy = CY, r = 0) {
  const rad = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(a1, a2, cx = CX, cy = CY, r = 0) {
  if (Math.abs(a2 - a1) < 0.01) return 'M0 0';
  const p1 = polar(a1, cx, cy, r);
  const p2 = polar(a2, cx, cy, r);
  const largeArc = (a2 - a1) > 180 ? 1 : 0;
  return `M${p1[0].toFixed(2)} ${p1[1].toFixed(2)} A${r} ${r} 0 ${largeArc} 1 ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
}

function angleFromPointer(clientX, clientY, svgEl, rectCache = null) {
  const rect = rectCache || (svgEl ? svgEl.getBoundingClientRect() : null);
  if (!rect || !rect.width || !rect.height) return 0;

  const sx = (clientX - rect.left) * (SVG_W / rect.width);
  const sy = (clientY - rect.top) * (SVG_H / rect.height);
  const deg = Math.atan2(sy - CY, sx - CX) * 180 / Math.PI + 90;

  return normalizeAngle(deg);
}

function progressOnArc(angle, start, span, preferProgress = 0) {
  const safeSpan = clamp(Number(span) || 0, 1, 360);
  const offset = clockwiseDistance(start, angle);

  if (safeSpan >= 360) return offset / 360;
  if (offset <= safeSpan) return offset / safeSpan;

  const distToEnd = offset - safeSpan;
  const distToStart = 360 - offset;

  if (Math.abs(distToStart - distToEnd) < 0.001) {
    return clamp(preferProgress, 0, 1);
  }

  return distToStart < distToEnd ? 0 : 1;
}

function isAutoEnabled(card, config) {
  const entityId = config.auto_entity;
  return card?._hass?.states?.[entityId]?.state === 'on';
}

function disableAutoAndHide(card, config) {
  const entityId = config.auto_entity;

  if (isAutoEnabled(card, config)) {
    card._hass?.callService('input_boolean', 'turn_off', {
      entity_id: entityId,
    });
  }

  if (card._humPanelAutoCloseTimer) {
    clearTimeout(card._humPanelAutoCloseTimer);
    card._humPanelAutoCloseTimer = null;
  }

  if (card._humPanelAutoPopupOpen) {
    card._humPanelAutoPopupOpen = false;
    card.requestUpdate();
  }
}

function getArcConfig(config = {}) {
  return {
    arc_start: config.arc_start !== undefined ? config.arc_start : 225,
    arc_span: config.arc_span !== undefined ? config.arc_span : 270,
    arc_radius: config.arc_radius !== undefined ? config.arc_radius : 300,
    arc_bg_color: config.arc_bg_color || 'rgba(255,255,255,0.08)',
    arc_cur_color: config.arc_cur_color || 'rgba(255,255,255,0.14)',
    arc_tgt_color_on: config.arc_tgt_color_on || 'var(--state-humidifier-color, #00bfff)',
    arc_tgt_color_off: config.arc_tgt_color_off || 'rgba(100,160,255,0.55)',
    arc_bg_width: config.arc_bg_width !== undefined ? config.arc_bg_width : 40,
    arc_cur_width: config.arc_cur_width !== undefined ? config.arc_cur_width : 40,
    arc_tgt_width: config.arc_tgt_width !== undefined ? config.arc_tgt_width : 40,
    arc_glow: config.arc_glow !== undefined ? config.arc_glow : true,
    dot_radius: config.dot_radius !== undefined ? config.dot_radius : 30,
    dot_hit_radius: config.dot_hit_radius !== undefined ? config.dot_hit_radius : 40,
    dot_ring_color_on: config.dot_ring_color_on || 'rgba(100,200,255,.7)',
    dot_ring_color_off: config.dot_ring_color_off || 'rgba(255,255,255,.25)',
    dot_glow: config.dot_glow !== undefined ? config.dot_glow : true,
  };
}

function buildArcState(card, arcConfig, cur, tgt) {
  const cacheKey = `${cur}_${tgt}_${arcConfig.arc_span}_${arcConfig.arc_start}_${arcConfig.arc_radius}`;

  if (card._arcStateCacheKey === cacheKey && card._arcStateCache) {
    return card._arcStateCache;
  }

  const start = arcConfig.arc_start;
  const span = clamp(arcConfig.arc_span, 1, 360);
  const radius = arcConfig.arc_radius;
  const end = start + span;
  const targetDeg = start + (tgt / 100) * span;
  const currentDeg = cur > 0 ? start + (cur / 100) * span : start;

  const result = {
    bgPath: arcPath(start, end - 0.05, CX, CY, radius),
    curPath: cur > 0 ? arcPath(start, Math.min(currentDeg, end - 0.1), CX, CY, radius) : 'M0 0',
    tgtPath: arcPath(Math.min(targetDeg + 0.1, end - 0.1), end - 0.05, CX, CY, radius),
    dotPos: polar(targetDeg, CX, CY, radius),
  };

  card._arcStateCacheKey = cacheKey;
  card._arcStateCache = result;
  return result;
}

function setTargetLocal(card, value) {
  card._targetHumidity = clamp(Math.round(value), 0, 100);
  card.requestUpdate();
}

function commitTarget(card, config, value) {
  const finalValue = clamp(Math.round(value), 0, 100);
  setTargetLocal(card, finalValue);
  card._ignoreStateUntil = Date.now() + TARGET_SYNC_GRACE_MS;

  if (card?._hass && config?.entity) {
    card._hass.callService('humidifier', 'set_humidity', {
      entity_id: config.entity,
      humidity: finalValue,
    });
  }
}

function onArcPointerMove(card, config, arcConfig, event) {
  if (!card || !card._dragging) return;
  event.preventDefault();

  const now = performance.now();
  if (card._lastFrameTime && (now - card._lastFrameTime < FRAME_MS)) return;
  if (card._rafPending) return;

  card._rafPending = true;

  requestAnimationFrame(() => {
    card._rafPending = false;
    card._lastFrameTime = performance.now();

    if (!card._dragging) return;

    const angle = angleFromPointer(event.clientX, event.clientY, card._arcSvgEl, card._svgRectCache);
    const progress = progressOnArc(
      angle,
      arcConfig.arc_start,
      arcConfig.arc_span,
      clamp(card._dragStartVal / 100, 0, 1)
    );

    const pointerValue = clamp(progress * 100, 0, 100);
    const nextValue = clamp(pointerValue - card._dragPointerOffset, 0, 100);
    setTargetLocal(card, nextValue);
  });
}

function onArcPointerUp(card, config, event) {
  if (!card || !card._dragging) return;

  if (card._captureEl && typeof card._captureEl.releasePointerCapture === 'function' && event.pointerId) {
    card._captureEl.releasePointerCapture(event.pointerId);
  }

  document.removeEventListener('pointermove', card._boundArcMove);
  document.removeEventListener('pointerup', card._boundArcUp);
  document.removeEventListener('pointercancel', card._boundArcUp);

  card._boundArcMove = null;
  card._boundArcUp = null;
  card._dragging = false;
  card._svgRectCache = null;
  card._rafPending = false;
  card._lastFrameTime = 0;

  commitTarget(card, config, card._targetHumidity);
  card.requestUpdate();
}

function ensureArcHandlers(card, config, arcConfig) {
  if (card._arcHandlersReady) return;
  card._arcHandlersReady = true;

  card._handleArcPointerDown = (event) => {
    if (!card?._hass) return;

    event.preventDefault();
    event.stopPropagation();

    disableAutoAndHide(card, config);

    card._arcSvgEl = card.shadowRoot ? card.shadowRoot.querySelector('#dh-arc-svg') : null;
    card._svgRectCache = card._arcSvgEl ? card._arcSvgEl.getBoundingClientRect() : null;
    card._dragging = true;

    let currentTgt = card._targetHumidity;
    if (currentTgt === undefined || currentTgt === null) {
      currentTgt = readHumidityTarget(card, config.entity, 50);
    }
    card._dragStartVal = currentTgt;

    card._captureEl = event.currentTarget;
    if (card._captureEl && typeof card._captureEl.setPointerCapture === 'function' && event.pointerId) {
      card._captureEl.setPointerCapture(event.pointerId);
    }

    const angle = angleFromPointer(event.clientX, event.clientY, card._arcSvgEl, card._svgRectCache);
    const progress = progressOnArc(
      angle,
      arcConfig.arc_start,
      arcConfig.arc_span,
      clamp(card._dragStartVal / 100, 0, 1)
    );

    const pointerValue = clamp(progress * 100, 0, 100);

    card._dragPointerOffset = pointerValue - card._dragStartVal;
    card._boundArcMove = (e) => onArcPointerMove(card, config, arcConfig, e);
    card._boundArcUp = (e) => onArcPointerUp(card, config, e);

    document.addEventListener('pointermove', card._boundArcMove, { passive: false });
    document.addEventListener('pointerup', card._boundArcUp);
    document.addEventListener('pointercancel', card._boundArcUp);

    card.requestUpdate();
  };
}

export function renderArcSlider(card, config = {}) {
  const arcConfig = getArcConfig(config);

  if (card._targetHumidity === null || card._targetHumidity === undefined) {
    card._targetHumidity = readHumidityTarget(card, config.entity, 50);
  }

  if (!card._dragging && Date.now() > (card._ignoreStateUntil || 0)) {
    card._targetHumidity = readHumidityTarget(card, config.entity, card._targetHumidity);
  }

  ensureArcHandlers(card, config, arcConfig);

  const isOn = isMainEntityOn(card, config.entity);
  const targetValue = clamp(card._targetHumidity, 0, 100);
  const currentValue = readCurrentHumidity(card, config, targetValue);
  const arc = buildArcState(card, arcConfig, currentValue, targetValue);

  const activeArcColor = arcConfig.arc_tgt_color_on;

  const dotXpct = (arc.dotPos[0] / SVG_W) * 100;
  const dotYpct = (arc.dotPos[1] / SVG_H) * 100;
  const rPctX = (arcConfig.dot_hit_radius / SVG_W) * 100;
  const rPctY = (arcConfig.dot_hit_radius / SVG_H) * 100;

  return html`
    <style>
      .dh-arc-main {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      .dh-arc-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 320 / 310;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
      }

      .dh-arc-svg {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        overflow: visible;
        display: block;
        touch-action: auto;
        pointer-events: none;
      }

      .dh-arc-svg.is-dragging {
        touch-action: none !important;
      }

      .dh-arc-bg {
        fill: none;
        stroke: ${arcConfig.arc_bg_color};
        stroke-linecap: round;
        stroke-width: ${arcConfig.arc_bg_width};
      }

      .dh-arc-cur {
        fill: none;
        stroke: ${arcConfig.arc_cur_color};
        stroke-linecap: round;
        stroke-width: ${arcConfig.arc_cur_width};
      }

      .dh-arc-tgt {
        fill: none;
        stroke-linecap: round;
        stroke-width: ${arcConfig.arc_tgt_width};
        transition: stroke 0.08s linear;
      }

      .dh-arc-hit {
        fill: none;
        stroke: transparent;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: ${arcConfig.arc_bg_width + 26};
        pointer-events: auto;
        touch-action: none;
        cursor: pointer;
      }

      .dh-dot-hit-overlay {
        position: absolute;
        border-radius: 50%;
        touch-action: none;
        cursor: grab;
        z-index: 3;
        pointer-events: auto;
      }
    </style>

    <div class="dh-arc-main">
      <div class="dh-arc-wrap">
        <svg class="dh-arc-svg ${card._dragging ? 'is-dragging' : ''}" viewBox="0 0 320 310" id="dh-arc-svg">
          <defs>
            <filter id="dh-fg" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b"></feGaussianBlur>
              <feMerge>
                <feMergeNode in="b"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
            </filter>

            <filter id="dh-fd" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b"></feGaussianBlur>
              <feMerge>
                <feMergeNode in="b"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
            </filter>

            <filter id="dh-drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.8"/>
            </filter>

            <radialGradient id="dh-metal-grad" cx="40%" cy="30%" r="60%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="70%" stop-color="#e0e5ec"/>
              <stop offset="100%" stop-color="#a3b1c6"/>
            </radialGradient>
          </defs>

          <path class="dh-arc-hit" d="${arc.bgPath}" @pointerdown=${card._handleArcPointerDown}></path>

          <path class="dh-arc-bg" d="${arc.bgPath}"></path>
          <path class="dh-arc-cur" d="${arc.curPath}"></path>
          <path
            class="dh-arc-tgt"
            d="${arc.tgtPath}"
            stroke="${isOn ? activeArcColor : arcConfig.arc_tgt_color_off}"
            style="${arcConfig.arc_glow && isOn && !card._dragging ? 'filter:url(#dh-fg)' : ''}"
          ></path>

          <g class="dh-dot-group" style="pointer-events: none;">
            <circle
              cx="${arc.dotPos[0]}"
              cy="${arc.dotPos[1]}"
              r="${arcConfig.dot_radius + 6}"
              fill="${isOn ? activeArcColor : 'transparent'}"
              opacity="0.4"
              style="${arcConfig.dot_glow && isOn && !card._dragging ? 'filter:url(#dh-fd)' : ''}"
            ></circle>

            <circle
              cx="${arc.dotPos[0]}"
              cy="${arc.dotPos[1]}"
              r="${arcConfig.dot_radius + 2}"
              fill="none"
              stroke="${isOn ? arcConfig.dot_ring_color_on : arcConfig.dot_ring_color_off}"
              stroke-width="2"
            ></circle>

            <circle
              cx="${arc.dotPos[0]}"
              cy="${arc.dotPos[1]}"
              r="${arcConfig.dot_radius}"
              fill="url(#dh-metal-grad)"
              filter="url(#dh-drop-shadow)"
            ></circle>

            <circle
              cx="${arc.dotPos[0]}"
              cy="${arc.dotPos[1]}"
              r="${Math.round(arcConfig.dot_radius * 0.35)}"
              fill="${isOn ? activeArcColor : 'rgba(150,160,180,0.5)'}"
            ></circle>
          </g>
        </svg>

        <div
          class="dh-dot-hit-overlay"
          style="left: ${dotXpct - rPctX}%; top: ${dotYpct - rPctY}%; width: ${rPctX * 2}%; height: ${rPctY * 2}%;"
          @pointerdown=${card._handleArcPointerDown}
        ></div>
      </div>
    </div>
  `;
}