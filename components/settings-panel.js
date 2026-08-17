import { html } from '../files/lit-proxy.js';

export function renderSettingsPanel(card, config) {
  if (!card._isSettingsOpen) return html``;

  if (card._openSections === undefined) {
    card._openSections = { auto: true, manual: false };
  }

  const hass = card._hass;
  if (!hass) return html``;

  const getVal = (id, def) => (hass.states[id] ? Number(hass.states[id].state) : def);

  const entities = {
    delta: config.delta_entity,
    min: config.min_rh_entity,
    max: config.max_rh_entity,
    calc: config.calc_entity,
    runtime: config.manual_runtime_entity,
    pause: config.manual_pause_runtime_entity,
  };

  const vals = {
    delta: getVal(entities.delta, 3.0),
    min: getVal(entities.min, 65),
    max: getVal(entities.max, 85),
    runtime: getVal(entities.runtime, 20),
    pause: getVal(entities.pause, 20),
    recommended: hass.states[entities.calc] ? hass.states[entities.calc].state : '--',
  };

  const updateValue = (id, val) =>
    hass.callService('input_number', 'set_value', {
      entity_id: id,
      value: Number(val),
    });

  const toggleSection = (id) => {
    card._openSections[id] = !card._openSections[id];
    card.requestUpdate();
  };

  const close = () => {
    card._sliderIntent = null;
    card._isSettingsOpen = false;
    card.requestUpdate();
  };

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const snapToStep = (val, min, step) => {
    if (!step || step <= 0) return val;
    const snapped = min + Math.round((val - min) / step) * step;
    return Number(snapped.toFixed(6));
  };

  const formatSliderValue = (value, step = 1) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '--';

    const stepStr = String(step);
    const decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;

    return num
      .toFixed(decimals)
      .replace(/\.0+$/, '')
      .replace(/(\.\d*?)0+$/, '$1');
  };

  const updateSliderLabel = (label, value, unit, step = 1) => {
    if (!label) return;
    label.textContent = `${formatSliderValue(value, step)}${unit}`;
  };

  const startIntentDrag = (e, entityId, unit, min, max, step) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const wrap = e.currentTarget;
    const input = wrap.querySelector('.sp-slider');
    const row = wrap.closest('.sp-row');
    const label = row ? row.querySelector('.sp-val') : null;

    if (!input) return;

    card._sliderIntent = {
      pointerId: e.pointerId,
      wrap,
      input,
      label,
      entityId,
      unit,
      min: Number(min),
      max: Number(max),
      step: Number(step),
      startX: e.clientX,
      startY: e.clientY,
      startValue: Number(input.value),
      dragging: false,
    };

    wrap.setPointerCapture?.(e.pointerId);
  };

  const moveIntentDrag = (e) => {
    const s = card._sliderIntent;
    if (!s) return;
    if (s.wrap !== e.currentTarget) return;
    if (s.pointerId !== e.pointerId) return;

    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!s.dragging) {
      if (absY > 8 && absY > absX) {
        s.wrap.releasePointerCapture?.(e.pointerId);
        card._sliderIntent = null;
        return;
      }

      if (absX < 10 || absX <= absY) return;

      s.dragging = true;
      s.wrap.classList.add('is-dragging');
    }

    e.preventDefault();

    const rect = s.wrap.getBoundingClientRect();
    let ratio = (e.clientX - rect.left) / rect.width;
    ratio = clamp(ratio, 0, 1);

    let value = s.min + ratio * (s.max - s.min);
    value = snapToStep(value, s.min, s.step);
    value = clamp(value, s.min, s.max);

    s.input.value = String(value);
    updateSliderLabel(s.label, value, s.unit, s.step);
  };

  const endIntentDrag = async (e) => {
    const s = card._sliderIntent;
    if (!s) return;
    if (s.wrap !== e.currentTarget) return;
    if (s.pointerId !== e.pointerId) return;

    s.wrap.releasePointerCapture?.(e.pointerId);
    s.wrap.classList.remove('is-dragging');

    if (s.dragging) {
      await updateValue(s.entityId, s.input.value);
    } else {
      s.input.value = String(s.startValue);
      updateSliderLabel(s.label, s.startValue, s.unit, s.step);
    }

    card._sliderIntent = null;
  };

  const cancelIntentDrag = (e) => {
    const s = card._sliderIntent;
    if (!s) return;
    if (s.wrap !== e.currentTarget) return;
    if (s.pointerId !== e.pointerId) return;

    s.wrap.releasePointerCapture?.(e.pointerId);
    s.wrap.classList.remove('is-dragging');

    s.input.value = String(s.startValue);
    updateSliderLabel(s.label, s.startValue, s.unit, s.step);

    card._sliderIntent = null;
  };

  const blockTapChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return html`
    <style>
      .sp-overlay { position: absolute; inset: 0; background: rgba(4, 8, 14, 0.72); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 12px; animation: sp-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }
      @keyframes sp-in { from { opacity: 0; transform: scale(0.96) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      .sp-modal { width: 100%; max-width: 296px; max-height: 82%; background: linear-gradient(145deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.01) 100%); border: 1px solid rgba(255,255,255,0.09); border-radius: 22px; box-shadow: 0 2px 0 rgba(255,255,255,0.06) inset, 0 32px 64px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(0,0,0,0.6); display: flex; flex-direction: column; overflow: hidden; font-family: 'SF Pro Display', 'Segoe UI', system-ui, sans-serif; }
      .sp-header { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px 12px; background: rgba(0,0,0,0.25); border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; }
      .sp-title { display: flex; align-items: center; gap: 7px; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.5); }
      .sp-title-dot { width: 6px; height: 6px; border-radius: 50%; background: #00d4ff; box-shadow: 0 0 8px #00d4ff; }
      .sp-close { width: 26px; height: 26px; border-radius: 9px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s, color 0.15s; }
      .sp-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .sp-close ha-icon { --mdc-icon-size: 14px; }
      .sp-scroll { padding: 10px; overflow-y: auto; flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 7px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; -webkit-overflow-scrolling: touch; }
      .sp-scroll::-webkit-scrollbar { width: 3px; }
      .sp-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
      .sp-panel { border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden; transition: border-color 0.25s; flex-shrink: 0; }
      .sp-panel.is-open { border-color: rgba(0, 212, 255, 0.22); }
      .sp-panel.is-open.manual { border-color: rgba(255, 198, 0, 0.22); }
      .sp-head { width: 100%; padding: 11px 14px; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.025); border: none; cursor: pointer; }
      .sp-head:hover { background: rgba(255,255,255,0.04); }
      .sp-panel.is-open .sp-head { background: rgba(0, 212, 255, 0.05); }
      .sp-panel.is-open.manual .sp-head { background: rgba(255, 198, 0, 0.05); }
      .sp-head-left { display: flex; align-items: center; gap: 9px; }
      .sp-icon-wrap { width: 28px; height: 28px; border-radius: 9px; background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2); display: flex; align-items: center; justify-content: center; }
      .manual .sp-icon-wrap { background: rgba(255, 198, 0, 0.1); border-color: rgba(255, 198, 0, 0.2); }
      .sp-icon-wrap ha-icon { --mdc-icon-size: 14px; color: #00d4ff; }
      .manual .sp-icon-wrap ha-icon { color: #ffc600; }
      .sp-head-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.65); letter-spacing: 0.2px; }
      .sp-panel.is-open .sp-head-label { color: rgba(255,255,255,0.9); }
      .sp-chevron { --mdc-icon-size: 15px; color: rgba(255,255,255,0.2); transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), color 0.2s; }
      .sp-panel.is-open .sp-chevron { transform: rotate(180deg); color: rgba(255,255,255,0.5); }
      .sp-body { padding: 4px 14px 14px; display: flex; flex-direction: column; gap: 14px; animation: sp-body-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both; }
      @keyframes sp-body-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      .sp-hud { background: rgba(0, 212, 255, 0.06); border: 1px solid rgba(0, 212, 255, 0.18); border-radius: 12px; padding: 11px 14px; display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden; }
      .sp-hud::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent); }
      .sp-hud-meta { display: flex; flex-direction: column; gap: 2px; }
      .sp-hud-label { font-size: 9px; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase; color: rgba(0, 212, 255, 0.6); }
      .sp-hud-sub { font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 0.3px; }
      .sp-hud-val { font-size: 28px; font-weight: 800; letter-spacing: -1px; color: #00d4ff; text-shadow: 0 0 20px rgba(0, 212, 255, 0.45); }
      .sp-row { display: flex; flex-direction: column; gap: 6px; }
      .sp-label-line { display: flex; justify-content: space-between; align-items: baseline; }
      .sp-label { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,0.3); }
      .sp-val { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.85); letter-spacing: -0.3px; }
      .manual .sp-val { color: #ffc600; }
      .sp-slider-wrap { position: relative; display: flex; align-items: center; width: 100%; min-height: 24px; touch-action: pan-y; user-select: none; -webkit-user-select: none; cursor: grab; }
      .sp-slider-wrap.is-dragging { cursor: grabbing; }
      .sp-slider { width: 100%; -webkit-appearance: none; appearance: none; height: 3px; border-radius: 2px; outline: none; background: rgba(255,255,255,0.07); border: none; pointer-events: none; }
      .sp-slider:disabled { opacity: 1; cursor: inherit; }
      .sp-slider:disabled::-webkit-slider-thumb { opacity: 1; }
      .sp-slider:disabled::-moz-range-thumb { opacity: 1; }
      .sp-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 6px; background: #00d4ff; border: 2px solid rgba(10, 14, 20, 0.9); box-shadow: 0 0 10px rgba(0, 212, 255, 0.5); transition: transform 0.12s, box-shadow 0.12s; }
      .sp-slider-wrap.is-dragging .sp-slider::-webkit-slider-thumb { transform: scale(1.2); box-shadow: 0 0 18px rgba(0, 212, 255, 0.7); }
      .manual .sp-slider::-webkit-slider-thumb { background: #ffc600; box-shadow: 0 0 10px rgba(255, 198, 0, 0.5); }
      .manual .sp-slider-wrap.is-dragging .sp-slider::-webkit-slider-thumb { box-shadow: 0 0 18px rgba(255, 198, 0, 0.7); }
      .sp-slider::-moz-range-track { height: 3px; border-radius: 2px; background: rgba(255,255,255,0.07); border: none; }
      .sp-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 6px; background: #00d4ff; border: 2px solid rgba(10, 14, 20, 0.9); box-shadow: 0 0 10px rgba(0, 212, 255, 0.5); }
      .manual .sp-slider::-moz-range-thumb { background: #ffc600; box-shadow: 0 0 10px rgba(255, 198, 0, 0.5); }
      .sp-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); margin: 0 -2px; flex-shrink: 0; }
    </style>

    <div class="sp-overlay" @click=${close}>
      <div class="sp-modal" @click=${(e) => e.stopPropagation()}>
        <div class="sp-header">
          <div class="sp-title">
            <span class="sp-title-dot"></span>
            Налаштування
          </div>
          <button class="sp-close" @click=${close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>

        <div class="sp-scroll">
          <div class="sp-panel ${card._openSections.auto ? 'is-open' : ''}">
            <button class="sp-head" @click=${() => toggleSection('auto')}>
              <div class="sp-head-left">
                <div class="sp-icon-wrap"><ha-icon icon="mdi:tune-variant"></ha-icon></div>
                <span class="sp-head-label">Авто-режим</span>
              </div>
              <ha-icon class="sp-chevron" icon="mdi:chevron-down"></ha-icon>
            </button>

            ${card._openSections.auto ? html`
              <div class="sp-body">
                <div class="sp-hud">
                  <div class="sp-hud-meta">
                    <span class="sp-hud-label">Рекомендація</span>
                    <span class="sp-hud-sub">розраховано автоматично</span>
                  </div>
                  <span class="sp-hud-val">${vals.recommended}%</span>
                </div>

                <div class="sp-divider"></div>

                <div class="sp-row">
                  <div class="sp-label-line">
                    <span class="sp-label">Дельта AH</span>
                    <span class="sp-val">${formatSliderValue(vals.delta, 0.1)} г/м³</span>
                  </div>
                  <div class="sp-slider-wrap" @pointerdown=${(e) => startIntentDrag(e, entities.delta, ' г/м³', 0.1, 10, 0.1)} @pointermove=${moveIntentDrag} @pointerup=${endIntentDrag} @pointercancel=${cancelIntentDrag} @click=${blockTapChange}>
                    <input class="sp-slider" type="range" min="0.1" max="10" step="0.1" .value=${String(vals.delta)} tabindex="-1" disabled>
                  </div>
                </div>

                <div class="sp-row">
                  <div class="sp-label-line">
                    <span class="sp-label">Min ліміт</span>
                    <span class="sp-val">${formatSliderValue(vals.min, 1)}%</span>
                  </div>
                  <div class="sp-slider-wrap" @pointerdown=${(e) => startIntentDrag(e, entities.min, '%', 30, 100, 1)} @pointermove=${moveIntentDrag} @pointerup=${endIntentDrag} @pointercancel=${cancelIntentDrag} @click=${blockTapChange}>
                    <input class="sp-slider" type="range" min="30" max="100" step="1" .value=${String(vals.min)} tabindex="-1" disabled>
                  </div>
                </div>

                <div class="sp-row">
                  <div class="sp-label-line">
                    <span class="sp-label">Max ліміт</span>
                    <span class="sp-val">${formatSliderValue(vals.max, 1)}%</span>
                  </div>
                  <div class="sp-slider-wrap" @pointerdown=${(e) => startIntentDrag(e, entities.max, '%', 30, 100, 1)} @pointermove=${moveIntentDrag} @pointerup=${endIntentDrag} @pointercancel=${cancelIntentDrag} @click=${blockTapChange}>
                    <input class="sp-slider" type="range" min="30" max="100" step="1" .value=${String(vals.max)} tabindex="-1" disabled>
                  </div>
                </div>
              </div>
            ` : html``}
          </div>

          <div class="sp-panel manual ${card._openSections.manual ? 'is-open' : ''}">
            <button class="sp-head" @click=${() => toggleSection('manual')}>
              <div class="sp-head-left">
                <div class="sp-icon-wrap"><ha-icon icon="mdi:timer-sand-complete"></ha-icon></div>
                <span class="sp-head-label">Таймери</span>
              </div>
              <ha-icon class="sp-chevron" icon="mdi:chevron-down"></ha-icon>
            </button>

            ${card._openSections.manual ? html`
              <div class="sp-body">
                <div class="sp-row">
                  <div class="sp-label-line">
                    <span class="sp-label">Ручний режим</span>
                    <span class="sp-val">${formatSliderValue(vals.runtime, 1)} хв</span>
                  </div>
                  <div class="sp-slider-wrap" @pointerdown=${(e) => startIntentDrag(e, entities.runtime, ' хв', 1, 120, 1)} @pointermove=${moveIntentDrag} @pointerup=${endIntentDrag} @pointercancel=${cancelIntentDrag} @click=${blockTapChange}>
                    <input class="sp-slider" type="range" min="1" max="120" step="1" .value=${String(vals.runtime)} tabindex="-1" disabled>
                  </div>
                </div>

                <div class="sp-row">
                  <div class="sp-label-line">
                    <span class="sp-label">Пауза</span>
                    <span class="sp-val">${formatSliderValue(vals.pause, 1)} хв</span>
                  </div>
                  <div class="sp-slider-wrap" @pointerdown=${(e) => startIntentDrag(e, entities.pause, ' хв', 1, 120, 1)} @pointermove=${moveIntentDrag} @pointerup=${endIntentDrag} @pointercancel=${cancelIntentDrag} @click=${blockTapChange}>
                    <input class="sp-slider" type="range" min="1" max="120" step="1" .value=${String(vals.pause)} tabindex="-1" disabled>
                  </div>
                </div>
              </div>
            ` : html``}
          </div>
        </div>
      </div>
    </div>
  `;
}