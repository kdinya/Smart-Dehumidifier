import { html, css, LitElement } from './files/lit-proxy.js?v=1.7.0';
import { EDITOR_SCHEMA, ENTITY_FIELDS } from './visual-editor-config.js?v=1.7.0';
import { t, getLang } from './i18n.js?v=1.7.0';

const STORAGE_KEY = 'dh-editor-open-sections-v8';
const SECTION_I18N = {
  entities: 'ed_entities',
  auto_humidity: 'ed_auto_humidity',
  layout: 'ed_layout',
  arc: 'ed_arc',
  humidity: 'ed_humidity',
  target: 'ed_target',
  buttons: 'ed_buttons',
  effects: 'ed_effects',
};

const EDITOR_VERSION = '1.5.1';

function fireEvent(node, type, detail = {}, options = {}) {
  const event = new CustomEvent(type, {
    detail,
    bubbles: options.bubbles ?? true,
    composed: options.composed ?? true,
  });
  node.dispatchEvent(event);
  return event;
}

function clamp(value, min, max) {
  const num = Number(value);
  if (Number.isNaN(num)) return min;
  return Math.min(Math.max(num, min), max);
}

function roundToStep(value, step = 1) {
  const s = Number(step) || 1;
  const rounded = Math.round(Number(value) / s) * s;
  const decimals = (String(s).split('.')[1] || '').length;
  return Number(rounded.toFixed(decimals));
}

function formatValue(value, step = 1) {
  const decimals = (String(step).split('.')[1] || '').length;
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
}

function readStoredSections() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_e) {
    return null;
  }
}

function writeStoredSections(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (_e) {
    // ignore
  }
}

function buildInitialSections(current = {}) {
  // All accordion tabs collapsed by default (including Entities).
  const result = { entities: false };
  for (const section of EDITOR_SCHEMA) {
    result[section.id] = false;
  }
  // Preserve only in-session toggles passed as `current` (not localStorage).
  if (current && typeof current === 'object') {
    for (const [id, open] of Object.entries(current)) {
      if (id in result || id === 'entities') result[id] = !!open;
    }
  }
  return result;
}

class DehumidifierEditor extends LitElement {
  static properties = {
    hass: {},
    _config: { state: true },
    _openSections: { state: true },
    _drafts: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color);
      --ed-accent: #16b9f0;
      --ed-border: rgba(255, 255, 255, 0.1);
      --ed-border-soft: rgba(255, 255, 255, 0.05);
      --ed-panel: rgba(255, 255, 255, 0.02);
      --ed-panel-2: rgba(255, 255, 255, 0.04);
      --ed-panel-3: rgba(255, 255, 255, 0.06);
      --ed-text-dim: rgba(255, 255, 255, 0.72);
    }
    .editor {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 4px 0 12px;
    }
    .entities-block {
      border: 2px solid rgba(22, 185, 240, 0.55);
      border-radius: 14px;
      overflow: hidden;
      background: rgba(22, 185, 240, 0.08);
    }
    .entities-head {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(22, 185, 240, 0.14);
      border-bottom: 1px solid rgba(22, 185, 240, 0.25);
      font-size: 14px;
      font-weight: 700;
    }
    .entities-hint {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.55);
      padding: 8px 14px 0;
      line-height: 1.35;
    }
    .entities-body {
      padding: 4px 10px 12px;
    }
    .section {
      border: 1px solid var(--ed-border);
      border-radius: 14px;
      overflow: hidden;
      background: var(--ed-panel);
    }
    .section-head {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 0;
      background: var(--ed-panel-2);
      color: inherit;
      padding: 11px 12px;
      cursor: pointer;
      text-align: left;
      font: inherit;
    }
    .section-head:hover {
      background: var(--ed-panel-3);
    }
    .section-emoji {
      width: 20px;
      text-align: center;
      flex-shrink: 0;
      font-size: 16px;
    }
    .section-title {
      flex: 1;
      font-size: 14px;
      font-weight: 700;
    }
    .section-arrow {
      opacity: 0.6;
      font-size: 12px;
      transition: transform 0.18s ease;
    }
    .section-arrow.open {
      transform: rotate(180deg);
    }
    .section-body {
      padding: 4px 8px 8px;
    }
    .field {
      padding: 9px 4px;
      border-bottom: 1px solid var(--ed-border-soft);
    }
    .field:last-child {
      border-bottom: 0;
    }
    .field-label {
      font-size: 13px;
      line-height: 1.25;
      margin-bottom: 7px;
      color: var(--ed-text-dim);
    }
    .field-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 7px;
    }
    .field-head .field-label {
      margin-bottom: 0;
      flex: 1;
    }
    .field-reset {
      flex-shrink: 0;
      border: 1px solid var(--ed-border);
      background: rgba(255, 255, 255, 0.03);
      color: rgba(255, 255, 255, 0.72);
      border-radius: 8px;
      height: 28px;
      min-width: 28px;
      padding: 0 8px;
      cursor: pointer;
      font: inherit;
      font-size: 12px;
    }
    .text-input,
    .select-input {
      width: 100%;
      box-sizing: border-box;
      border-radius: 10px;
      border: 1px solid var(--ed-border);
      background: rgba(255, 255, 255, 0.03);
      color: inherit;
      padding: 9px 10px;
      font: inherit;
      font-size: 13px;
      outline: none;
      margin-top: 6px;
    }
    .text-input:focus,
    .select-input:focus {
      border-color: rgba(22, 185, 240, 0.5);
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .toggle-row .field-label {
      margin-bottom: 0;
      font-weight: 500;
      color: #fff;
    }
    .switch {
      position: relative;
      width: 46px;
      height: 25px;
      flex-shrink: 0;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }
    .slider {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.15);
      transition: 0.2s;
      cursor: pointer;
    }
    .slider::before {
      content: '';
      position: absolute;
      width: 19px;
      height: 19px;
      left: 3px;
      top: 3px;
      border-radius: 50%;
      background: #fff;
      transition: 0.2s;
    }
    .switch input:checked + .slider {
      background: var(--ed-accent);
    }
    .switch input:checked + .slider::before {
      transform: translateX(21px);
    }
    .num-row {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr) 34px 54px;
      align-items: center;
      gap: 8px;
    }
    .num-btn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      border: 1px solid var(--ed-border);
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
      font: inherit;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
    }
    .range {
      width: 100%;
      accent-color: var(--ed-accent);
      cursor: pointer;
      height: 4px;
    }
    .num-value {
      text-align: right;
      color: var(--ed-accent);
      font-size: 13px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    ha-entity-picker {
      display: block;
      width: 100%;
    }
    .editor-ver {
      font-size: 10px;
      opacity: 0.35;
      text-align: right;
      padding: 0 4px;
    }
  `;

  constructor() {
    super();
    this._config = {};
    this._openSections = buildInitialSections();
    this._drafts = {};
  }

  setConfig(config) {
    this._config = { ...(config || {}) };
    this._openSections = buildInitialSections(this._openSections);
  }

  _fieldValue(field) {
    const value = this._config?.[field.key];
    return value !== undefined ? value : field.default;
  }

  _draftValue(field) {
    return Object.prototype.hasOwnProperty.call(this._drafts, field.key)
      ? this._drafts[field.key]
      : String(this._fieldValue(field) ?? '');
  }

  _emitConfig(next) {
    this._config = next;
    fireEvent(this, 'config-changed', { config: next });
  }

  _setValue(field, rawValue) {
    const next = { ...this._config };
    if (field.type === 'tog') {
      next[field.key] = !!rawValue;
    } else if (field.type === 'num') {
      next[field.key] = clamp(
        roundToStep(rawValue, field.step ?? 1),
        field.min ?? -Infinity,
        field.max ?? Infinity
      );
    } else {
      const str = String(rawValue ?? '').trim();
      if (str) next[field.key] = str;
      else delete next[field.key];
    }
    this._emitConfig(next);
  }

  _changeByStep(field, direction) {
    const current = Number(this._fieldValue(field) ?? 0);
    const step = Number(field.step ?? 1);
    this._setValue(field, current + direction * step);
  }


  _tt(key) {
    try {
      return t(this.hass, key, this._config || {});
    } catch (_e) {
      return key;
    }
  }

  _sectionTitle(section) {
    try {
      const key = SECTION_I18N[section?.id];
      if (key) return this._tt(key);
    } catch (_e) {}
    return section?.title || section?.id || '';
  }

  _toggleSection(id) {
    this._openSections = {
      ...this._openSections,
      [id]: !this._openSections[id],
    };
    writeStoredSections(this._openSections);
    this.requestUpdate();
  }

  _resetField(field) {
    const next = { ...this._config };
    delete next[field.key];
    const nextDrafts = { ...this._drafts };
    delete nextDrafts[field.key];
    this._drafts = nextDrafts;
    this._emitConfig(next);
  }

  _onTextInput(field, e) {
    this._drafts = { ...this._drafts, [field.key]: e.target.value };
  }

  _commitTextDraft(field) {
    if (!Object.prototype.hasOwnProperty.call(this._drafts, field.key)) return;
    const value = this._drafts[field.key];
    const nextDrafts = { ...this._drafts };
    delete nextDrafts[field.key];
    this._drafts = nextDrafts;
    this._setValue(field, value);
  }

  _renderReset(field) {
    if (!Object.prototype.hasOwnProperty.call(this._config || {}, field.key)) {
      return html``;
    }
    return html`
      <button class="field-reset" type="button" @click=${() => this._resetField(field)} title="Reset">
        ↺
      </button>
    `;
  }

  _renderToggle(field) {
    const value = Boolean(this._fieldValue(field));
    return html`
      <div class="field">
        <div class="toggle-row">
          <div class="field-label">${field.label}</div>
          <label class="switch">
            <input type="checkbox" .checked=${value} @change=${(e) => this._setValue(field, e.target.checked)} />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `;
  }

  _renderSelect(field) {
    const value = String(this._fieldValue(field) ?? '');
    return html`
      <div class="field">
        <div class="field-head">
          <div class="field-label">${field.label}</div>
          ${this._renderReset(field)}
        </div>
        <select class="select-input" .value=${value} @change=${(e) => this._setValue(field, e.target.value)}>
          ${(field.options || []).map((o) => {
            const labelKey = o.value === 'left' ? 'align_left' : o.value === 'right' ? 'align_right' : o.value === 'center' ? 'align_center' : null;
            const label = labelKey ? this._tt(labelKey) : o.label;
            return html`<option value=${o.value}>${label}</option>`;
          })}
        </select>
      </div>
    `;
  }

  _renderText(field) {
    const value = this._draftValue(field);
    return html`
      <div class="field">
        <div class="field-head">
          <div class="field-label">${field.label}</div>
          ${this._renderReset(field)}
        </div>
        <input
          class="text-input"
          type="text"
          .value=${value}
          @input=${(e) => this._onTextInput(field, e)}
          @change=${() => this._commitTextDraft(field)}
          @blur=${() => this._commitTextDraft(field)}
        />
      </div>
    `;
  }

  _rangeValueFromPointer(input, clientX, min, max, step) {
    const rect = input.getBoundingClientRect();
    if (rect.width <= 0) return Number(input.value);
    let ratio = (clientX - rect.left) / rect.width;
    ratio = Math.min(1, Math.max(0, ratio));
    let raw = min + ratio * (max - min);
    const stepped = Math.round(raw / step) * step;
    return clamp(stepped, min, max);
  }

  _onRangePointerDown(e) {
    const input = e.currentTarget;
    input._sdGesture = {
      startX: e.clientX,
      startY: e.clientY,
      axis: null,
      moved: false,
    };
    try {
      input.setPointerCapture(e.pointerId);
    } catch (_err) {}
    e.preventDefault();
  }

  _onRangePointerMove(field, min, max, step) {
    return (e) => {
      const input = e.currentTarget;
      const g = input._sdGesture;
      if (!g) return;
      const dx = Math.abs(e.clientX - g.startX);
      const dy = Math.abs(e.clientY - g.startY);
      if (!g.axis) {
        if (dx < 8 && dy < 8) return;
        g.axis = dx >= dy ? 'x' : 'y';
      }
      if (g.axis === 'y') return;
      g.moved = true;
      const v = this._rangeValueFromPointer(input, e.clientX, min, max, step);
      input.value = String(v);
      this._setValue(field, v);
      e.preventDefault();
    };
  }

  _onRangePointerUp(e) {
    e.currentTarget._sdGesture = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_err) {}
  }

  _renderNumber(field) {
    const min = field.min ?? 0;
    const max = field.max ?? 100;
    const step = field.step ?? 1;
    const value = Number(this._fieldValue(field) ?? min);
    return html`
      <div class="field">
        <div class="field-head">
          <div class="field-label">${field.label}</div>
          ${this._renderReset(field)}
        </div>
        <div class="num-row">
          <button class="num-btn" type="button" @click=${() => this._changeByStep(field, -1)}>−</button>
          <input
            class="range"
            type="range"
            min=${min}
            max=${max}
            step=${step}
            .value=${String(value)}
            style="touch-action: none;"
            @pointerdown=${(e) => this._onRangePointerDown(e)}
            @pointermove=${this._onRangePointerMove(field, min, max, step)}
            @pointerup=${(e) => this._onRangePointerUp(e)}
            @pointercancel=${(e) => this._onRangePointerUp(e)}
          />
          <button class="num-btn" type="button" @click=${() => this._changeByStep(field, 1)}>+</button>
          <div class="num-value">${formatValue(value, step)}</div>
        </div>
      </div>
    `;
  }

  _renderEntity(field) {
    const value = this._fieldValue(field) || '';
    const domain = field.domain || null;
    const domains = domain ? [domain] : undefined;

    return html`
      <div class="field">
        <div class="field-head">
          <div class="field-label">
            ${field.label}
            ${field.required ? html`<span style="color:#f87171;margin-left:4px;">*</span>` : ''}
          </div>
          ${this._renderReset(field)}
        </div>
        ${this.hass
          ? html`
              <ha-entity-picker
                .hass=${this.hass}
                .value=${value}
                .includeDomains=${domains}
                .allowCustomEntity=${true}
                @value-changed=${(e) => this._setValue(field, e.detail?.value ?? '')}
              ></ha-entity-picker>
            `
          : html`
              <input
                class="text-input"
                type="text"
                placeholder=${domain ? `${domain}.my_entity` : 'domain.entity_id'}
                .value=${value}
                @change=${(e) => this._setValue(field, e.target.value)}
                @blur=${(e) => this._setValue(field, e.target.value)}
              />
            `}
      </div>
    `;
  }

  _renderField(field) {
    if (field.type === 'tog') return this._renderToggle(field);
    if (field.type === 'select') return this._renderSelect(field);
    if (field.type === 'num') return this._renderNumber(field);
    if (field.type === 'entity') return this._renderEntity(field);
    return this._renderText(field);
  }

  render() {
    const entityFields = Array.isArray(ENTITY_FIELDS) ? ENTITY_FIELDS : [];
    const optionSections = (EDITOR_SCHEMA || []).filter((s) => s && s.id !== 'entities');
    if (!this._openSections || typeof this._openSections !== 'object') {
      this._openSections = buildInitialSections();
    }

    return html`
      <div class="editor">
        <div class="entities-block">
          <button
            class="entities-head"
            type="button"
            style="width:100%;border:0;cursor:pointer;text-align:left;font:inherit;color:inherit;"
            @click=${() => this._toggleSection('entities')}
          >
            <span style="flex:1">🔌 ${this._tt('ed_entities')}</span>
            <span class="section-arrow ${this._openSections.entities ? 'open' : ''}">▼</span>
          </button>
          ${this._openSections.entities
            ? html`
                <div class="entities-hint">
                  Обери entity через picker або впиши вручну. Обов'язковий — основний осушувач.
                </div>
                <div class="entities-body">
                  ${entityFields.length
                    ? entityFields.map((field) => this._renderEntity(field))
                    : html`<div class="field-label">Не вдалося завантажити список сутностей</div>`}
                </div>
              `
            : html``}
        </div>

        ${optionSections.map((section) => {
          const isOpen = !!this._openSections[section.id];
          return html`
            <div class="section">
              <button class="section-head" type="button" @click=${() => this._toggleSection(section.id)}>
                <span class="section-emoji">${section.em}</span>
                <span class="section-title">${this._sectionTitle(section)}</span>
                <span class="section-arrow ${isOpen ? 'open' : ''}">▼</span>
              </button>
              ${isOpen
                ? html`<div class="section-body">${section.fields.map((f) => this._renderField(f))}</div>`
                : html``}
            </div>
          `;
        })}
        <div class="editor-ver">editor ${EDITOR_VERSION}</div>
      </div>
    `;
  }
}

if (!customElements.get('smart-dehumidifier-editor')) {
  customElements.define('smart-dehumidifier-editor', DehumidifierEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'smart-dehumidifier')) {
  window.customCards.push({
    type: 'smart-dehumidifier',
    name: 'Smart Dehumidifier',
    description: 'Premium dehumidifier card with entity pickers',
    preview: true,
    documentationURL: 'https://github.com/kdinya/Smart-Dehumidifier',
  });
}
