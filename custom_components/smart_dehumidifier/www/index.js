/* Smart Dehumidifier card — self-contained entry for /smart_dehumidifier_files/index.js */
export const SMART_DEHUMIDIFIER_VERSION = '2.1.0';
console.info(
  `%c Smart Dehumidifier %c v${SMART_DEHUMIDIFIER_VERSION} `,
  'background:#0f1720;color:#7dd3fc;padding:2px 8px;border-radius:8px 0 0 8px;font-weight:700;',
  'background:#111827;color:#e5e7eb;padding:2px 8px;border-radius:0 8px 8px 0;font-weight:700;'
);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// files/lit-core.min.js
var t = globalThis;
var s = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var i = /* @__PURE__ */ Symbol();
var e = /* @__PURE__ */ new WeakMap();
var h = class {
  constructor(t3, s2, e2) {
    if (this._$cssResult$ = true, e2 !== i) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3, this.t = s2;
  }
  get styleSheet() {
    let t3 = this.i;
    const i2 = this.t;
    if (s && void 0 === t3) {
      const s2 = void 0 !== i2 && 1 === i2.length;
      s2 && (t3 = e.get(i2)), void 0 === t3 && ((this.i = t3 = new CSSStyleSheet()).replaceSync(this.cssText), s2 && e.set(i2, t3));
    }
    return t3;
  }
  toString() {
    return this.cssText;
  }
};
var o = (t3) => new h("string" == typeof t3 ? t3 : t3 + "", void 0, i);
var r = (t3, ...s2) => {
  const e2 = 1 === t3.length ? t3[0] : s2.reduce(((s3, i2, e3) => s3 + ((t4) => {
    if (true === t4._$cssResult$) return t4.cssText;
    if ("number" == typeof t4) return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i2) + t3[e3 + 1]), t3[0]);
  return new h(e2, t3, i);
};
var n = (i2, e2) => {
  if (s) i2.adoptedStyleSheets = e2.map(((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet));
  else for (const s2 of e2) {
    const e3 = document.createElement("style"), h2 = t.litNonce;
    void 0 !== h2 && e3.setAttribute("nonce", h2), e3.textContent = s2.cssText, i2.appendChild(e3);
  }
};
var c = s ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let s2 = "";
  for (const i2 of t4.cssRules) s2 += i2.cssText;
  return o(s2);
})(t3) : t3;
var { is: a, defineProperty: l, getOwnPropertyDescriptor: u, getOwnPropertyNames: d, getOwnPropertySymbols: f, getPrototypeOf: p } = Object;
var v = globalThis;
var m = v.trustedTypes;
var y = m ? m.emptyScript : "";
var g = v.reactiveElementPolyfillSupport;
var _ = (t3, s2) => t3;
var b = { toAttribute(t3, s2) {
  switch (s2) {
    case Boolean:
      t3 = t3 ? y : null;
      break;
    case Object:
    case Array:
      t3 = null == t3 ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, s2) {
  let i2 = t3;
  switch (s2) {
    case Boolean:
      i2 = null !== t3;
      break;
    case Number:
      i2 = null === t3 ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        i2 = JSON.parse(t3);
      } catch (t4) {
        i2 = null;
      }
  }
  return i2;
} };
var S = (t3, s2) => !a(t3, s2);
var w = { attribute: true, type: String, converter: b, reflect: false, useDefault: false, hasChanged: S };
Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), v.litPropertyMetadata ?? (v.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var $ = class extends HTMLElement {
  static addInitializer(t3) {
    this.o(), (this.l ?? (this.l = [])).push(t3);
  }
  static get observedAttributes() {
    return this.finalize(), this.u && [...this.u.keys()];
  }
  static createProperty(t3, s2 = w) {
    if (s2.state && (s2.attribute = false), this.o(), this.prototype.hasOwnProperty(t3) && ((s2 = Object.create(s2)).wrapped = true), this.elementProperties.set(t3, s2), !s2.noAccessor) {
      const i2 = /* @__PURE__ */ Symbol(), e2 = this.getPropertyDescriptor(t3, i2, s2);
      void 0 !== e2 && l(this.prototype, t3, e2);
    }
  }
  static getPropertyDescriptor(t3, s2, i2) {
    const { get: e2, set: h2 } = u(this.prototype, t3) ?? { get() {
      return this[s2];
    }, set(t4) {
      this[s2] = t4;
    } };
    return { get: e2, set(s3) {
      const o2 = e2?.call(this);
      h2?.call(this, s3), this.requestUpdate(t3, o2, i2);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) ?? w;
  }
  static o() {
    if (this.hasOwnProperty(_("elementProperties"))) return;
    const t3 = p(this);
    t3.finalize(), void 0 !== t3.l && (this.l = [...t3.l]), this.elementProperties = new Map(t3.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(_("finalized"))) return;
    if (this.finalized = true, this.o(), this.hasOwnProperty(_("properties"))) {
      const t4 = this.properties, s2 = [...d(t4), ...f(t4)];
      for (const i2 of s2) this.createProperty(i2, t4[i2]);
    }
    const t3 = this[Symbol.metadata];
    if (null !== t3) {
      const s2 = litPropertyMetadata.get(t3);
      if (void 0 !== s2) for (const [t4, i2] of s2) this.elementProperties.set(t4, i2);
    }
    this.u = /* @__PURE__ */ new Map();
    for (const [t4, s2] of this.elementProperties) {
      const i2 = this.p(t4, s2);
      void 0 !== i2 && this.u.set(i2, t4);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t3) {
    const s2 = [];
    if (Array.isArray(t3)) {
      const i2 = new Set(t3.flat(1 / 0).reverse());
      for (const t4 of i2) s2.unshift(c(t4));
    } else void 0 !== t3 && s2.push(c(t3));
    return s2;
  }
  static p(t3, s2) {
    const i2 = s2.attribute;
    return false === i2 ? void 0 : "string" == typeof i2 ? i2 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
  }
  constructor() {
    super(), this.v = void 0, this.isUpdatePending = false, this.hasUpdated = false, this.m = null, this._();
  }
  _() {
    this.S = new Promise(((t3) => this.enableUpdating = t3)), this._$AL = /* @__PURE__ */ new Map(), this.$(), this.requestUpdate(), this.constructor.l?.forEach(((t3) => t3(this)));
  }
  addController(t3) {
    (this.P ?? (this.P = /* @__PURE__ */ new Set())).add(t3), void 0 !== this.renderRoot && this.isConnected && t3.hostConnected?.();
  }
  removeController(t3) {
    this.P?.delete(t3);
  }
  $() {
    const t3 = /* @__PURE__ */ new Map(), s2 = this.constructor.elementProperties;
    for (const i2 of s2.keys()) this.hasOwnProperty(i2) && (t3.set(i2, this[i2]), delete this[i2]);
    t3.size > 0 && (this.v = t3);
  }
  createRenderRoot() {
    const t3 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return n(t3, this.constructor.elementStyles), t3;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this.P?.forEach(((t3) => t3.hostConnected?.()));
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    this.P?.forEach(((t3) => t3.hostDisconnected?.()));
  }
  attributeChangedCallback(t3, s2, i2) {
    this._$AK(t3, i2);
  }
  C(t3, s2) {
    const i2 = this.constructor.elementProperties.get(t3), e2 = this.constructor.p(t3, i2);
    if (void 0 !== e2 && true === i2.reflect) {
      const h2 = (void 0 !== i2.converter?.toAttribute ? i2.converter : b).toAttribute(s2, i2.type);
      this.m = t3, null == h2 ? this.removeAttribute(e2) : this.setAttribute(e2, h2), this.m = null;
    }
  }
  _$AK(t3, s2) {
    const i2 = this.constructor, e2 = i2.u.get(t3);
    if (void 0 !== e2 && this.m !== e2) {
      const t4 = i2.getPropertyOptions(e2), h2 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== t4.converter?.fromAttribute ? t4.converter : b;
      this.m = e2;
      const o2 = h2.fromAttribute(s2, t4.type);
      this[e2] = o2 ?? this.T?.get(e2) ?? o2, this.m = null;
    }
  }
  requestUpdate(t3, s2, i2) {
    if (void 0 !== t3) {
      const e2 = this.constructor, h2 = this[t3];
      if (i2 ?? (i2 = e2.getPropertyOptions(t3)), !((i2.hasChanged ?? S)(h2, s2) || i2.useDefault && i2.reflect && h2 === this.T?.get(t3) && !this.hasAttribute(e2.p(t3, i2)))) return;
      this.M(t3, s2, i2);
    }
    false === this.isUpdatePending && (this.S = this.k());
  }
  M(t3, s2, { useDefault: i2, reflect: e2, wrapped: h2 }, o2) {
    i2 && !(this.T ?? (this.T = /* @__PURE__ */ new Map())).has(t3) && (this.T.set(t3, o2 ?? s2 ?? this[t3]), true !== h2 || void 0 !== o2) || (this._$AL.has(t3) || (this.hasUpdated || i2 || (s2 = void 0), this._$AL.set(t3, s2)), true === e2 && this.m !== t3 && (this.A ?? (this.A = /* @__PURE__ */ new Set())).add(t3));
  }
  async k() {
    this.isUpdatePending = true;
    try {
      await this.S;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return null != t3 && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.v) {
        for (const [t5, s3] of this.v) this[t5] = s3;
        this.v = void 0;
      }
      const t4 = this.constructor.elementProperties;
      if (t4.size > 0) for (const [s3, i2] of t4) {
        const { wrapped: t5 } = i2, e2 = this[s3];
        true !== t5 || this._$AL.has(s3) || void 0 === e2 || this.M(s3, void 0, i2, e2);
      }
    }
    let t3 = false;
    const s2 = this._$AL;
    try {
      t3 = this.shouldUpdate(s2), t3 ? (this.willUpdate(s2), this.P?.forEach(((t4) => t4.hostUpdate?.())), this.update(s2)) : this.U();
    } catch (s3) {
      throw t3 = false, this.U(), s3;
    }
    t3 && this._$AE(s2);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    this.P?.forEach(((t4) => t4.hostUpdated?.())), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
  }
  U() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this.S;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this.A && (this.A = this.A.forEach(((t4) => this.C(t4, this[t4])))), this.U();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
$.elementStyles = [], $.shadowRootOptions = { mode: "open" }, $[_("elementProperties")] = /* @__PURE__ */ new Map(), $[_("finalized")] = /* @__PURE__ */ new Map(), g?.({ ReactiveElement: $ }), (v.reactiveElementVersions ?? (v.reactiveElementVersions = [])).push("2.1.1");
var P = globalThis;
var C = P.trustedTypes;
var T = C ? C.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var M = "$lit$";
var x = `lit$${Math.random().toFixed(9).slice(2)}$`;
var k = "?" + x;
var A = `<${k}>`;
var E = document;
var U = () => E.createComment("");
var N = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
var O = Array.isArray;
var R = (t3) => O(t3) || "function" == typeof t3?.[Symbol.iterator];
var z = "[ 	\n\f\r]";
var V = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var D = /-->/g;
var L = />/g;
var j = RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var I = /'/g;
var H = /"/g;
var B = /^(?:script|style|textarea|title)$/i;
var W = (t3) => (s2, ...i2) => ({ _$litType$: t3, strings: s2, values: i2 });
var q = W(1);
var J = W(2);
var Z = W(3);
var F = /* @__PURE__ */ Symbol.for("lit-noChange");
var G = /* @__PURE__ */ Symbol.for("lit-nothing");
var K = /* @__PURE__ */ new WeakMap();
var Q = E.createTreeWalker(E, 129);
function X(t3, s2) {
  if (!O(t3) || !t3.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== T ? T.createHTML(s2) : s2;
}
var Y = (t3, s2) => {
  const i2 = t3.length - 1, e2 = [];
  let h2, o2 = 2 === s2 ? "<svg>" : 3 === s2 ? "<math>" : "", r2 = V;
  for (let s3 = 0; s3 < i2; s3++) {
    const i3 = t3[s3];
    let n2, c2, a2 = -1, l2 = 0;
    for (; l2 < i3.length && (r2.lastIndex = l2, c2 = r2.exec(i3), null !== c2); ) l2 = r2.lastIndex, r2 === V ? "!--" === c2[1] ? r2 = D : void 0 !== c2[1] ? r2 = L : void 0 !== c2[2] ? (B.test(c2[2]) && (h2 = RegExp("</" + c2[2], "g")), r2 = j) : void 0 !== c2[3] && (r2 = j) : r2 === j ? ">" === c2[0] ? (r2 = h2 ?? V, a2 = -1) : void 0 === c2[1] ? a2 = -2 : (a2 = r2.lastIndex - c2[2].length, n2 = c2[1], r2 = void 0 === c2[3] ? j : '"' === c2[3] ? H : I) : r2 === H || r2 === I ? r2 = j : r2 === D || r2 === L ? r2 = V : (r2 = j, h2 = void 0);
    const u2 = r2 === j && t3[s3 + 1].startsWith("/>") ? " " : "";
    o2 += r2 === V ? i3 + A : a2 >= 0 ? (e2.push(n2), i3.slice(0, a2) + M + i3.slice(a2) + x + u2) : i3 + x + (-2 === a2 ? s3 : u2);
  }
  return [X(t3, o2 + (t3[i2] || "<?>") + (2 === s2 ? "</svg>" : 3 === s2 ? "</math>" : "")), e2];
};
var tt = class _tt {
  constructor({ strings: t3, _$litType$: s2 }, i2) {
    let e2;
    this.parts = [];
    let h2 = 0, o2 = 0;
    const r2 = t3.length - 1, n2 = this.parts, [c2, a2] = Y(t3, s2);
    if (this.el = _tt.createElement(c2, i2), Q.currentNode = this.el.content, 2 === s2 || 3 === s2) {
      const t4 = this.el.content.firstChild;
      t4.replaceWith(...t4.childNodes);
    }
    for (; null !== (e2 = Q.nextNode()) && n2.length < r2; ) {
      if (1 === e2.nodeType) {
        if (e2.hasAttributes()) for (const t4 of e2.getAttributeNames()) if (t4.endsWith(M)) {
          const s3 = a2[o2++], i3 = e2.getAttribute(t4).split(x), r3 = /([.?@])?(.*)/.exec(s3);
          n2.push({ type: 1, index: h2, name: r3[2], strings: i3, ctor: "." === r3[1] ? ot : "?" === r3[1] ? rt : "@" === r3[1] ? nt : ht }), e2.removeAttribute(t4);
        } else t4.startsWith(x) && (n2.push({ type: 6, index: h2 }), e2.removeAttribute(t4));
        if (B.test(e2.tagName)) {
          const t4 = e2.textContent.split(x), s3 = t4.length - 1;
          if (s3 > 0) {
            e2.textContent = C ? C.emptyScript : "";
            for (let i3 = 0; i3 < s3; i3++) e2.append(t4[i3], U()), Q.nextNode(), n2.push({ type: 2, index: ++h2 });
            e2.append(t4[s3], U());
          }
        }
      } else if (8 === e2.nodeType) if (e2.data === k) n2.push({ type: 2, index: h2 });
      else {
        let t4 = -1;
        for (; -1 !== (t4 = e2.data.indexOf(x, t4 + 1)); ) n2.push({ type: 7, index: h2 }), t4 += x.length - 1;
      }
      h2++;
    }
  }
  static createElement(t3, s2) {
    const i2 = E.createElement("template");
    return i2.innerHTML = t3, i2;
  }
};
function st(t3, s2, i2 = t3, e2) {
  if (s2 === F) return s2;
  let h2 = void 0 !== e2 ? i2.N?.[e2] : i2.O;
  const o2 = N(s2) ? void 0 : s2._$litDirective$;
  return h2?.constructor !== o2 && (h2?._$AO?.(false), void 0 === o2 ? h2 = void 0 : (h2 = new o2(t3), h2._$AT(t3, i2, e2)), void 0 !== e2 ? (i2.N ?? (i2.N = []))[e2] = h2 : i2.O = h2), void 0 !== h2 && (s2 = st(t3, h2._$AS(t3, s2.values), h2, e2)), s2;
}
var it = class {
  constructor(t3, s2) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = s2;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  R(t3) {
    const { el: { content: s2 }, parts: i2 } = this._$AD, e2 = (t3?.creationScope ?? E).importNode(s2, true);
    Q.currentNode = e2;
    let h2 = Q.nextNode(), o2 = 0, r2 = 0, n2 = i2[0];
    for (; void 0 !== n2; ) {
      if (o2 === n2.index) {
        let s3;
        2 === n2.type ? s3 = new et(h2, h2.nextSibling, this, t3) : 1 === n2.type ? s3 = new n2.ctor(h2, n2.name, n2.strings, this, t3) : 6 === n2.type && (s3 = new ct(h2, this, t3)), this._$AV.push(s3), n2 = i2[++r2];
      }
      o2 !== n2?.index && (h2 = Q.nextNode(), o2++);
    }
    return Q.currentNode = E, e2;
  }
  V(t3) {
    let s2 = 0;
    for (const i2 of this._$AV) void 0 !== i2 && (void 0 !== i2.strings ? (i2._$AI(t3, i2, s2), s2 += i2.strings.length - 2) : i2._$AI(t3[s2])), s2++;
  }
};
var et = class _et {
  get _$AU() {
    return this._$AM?._$AU ?? this.D;
  }
  constructor(t3, s2, i2, e2) {
    this.type = 2, this._$AH = G, this._$AN = void 0, this._$AA = t3, this._$AB = s2, this._$AM = i2, this.options = e2, this.D = e2?.isConnected ?? true;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const s2 = this._$AM;
    return void 0 !== s2 && 11 === t3?.nodeType && (t3 = s2.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, s2 = this) {
    t3 = st(this, t3, s2), N(t3) ? t3 === G || null == t3 || "" === t3 ? (this._$AH !== G && this._$AR(), this._$AH = G) : t3 !== this._$AH && t3 !== F && this.L(t3) : void 0 !== t3._$litType$ ? this.j(t3) : void 0 !== t3.nodeType ? this.I(t3) : R(t3) ? this.H(t3) : this.L(t3);
  }
  B(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  I(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.B(t3));
  }
  L(t3) {
    this._$AH !== G && N(this._$AH) ? this._$AA.nextSibling.data = t3 : this.I(E.createTextNode(t3)), this._$AH = t3;
  }
  j(t3) {
    const { values: s2, _$litType$: i2 } = t3, e2 = "number" == typeof i2 ? this._$AC(t3) : (void 0 === i2.el && (i2.el = tt.createElement(X(i2.h, i2.h[0]), this.options)), i2);
    if (this._$AH?._$AD === e2) this._$AH.V(s2);
    else {
      const t4 = new it(e2, this), i3 = t4.R(this.options);
      t4.V(s2), this.I(i3), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let s2 = K.get(t3.strings);
    return void 0 === s2 && K.set(t3.strings, s2 = new tt(t3)), s2;
  }
  H(t3) {
    O(this._$AH) || (this._$AH = [], this._$AR());
    const s2 = this._$AH;
    let i2, e2 = 0;
    for (const h2 of t3) e2 === s2.length ? s2.push(i2 = new _et(this.B(U()), this.B(U()), this, this.options)) : i2 = s2[e2], i2._$AI(h2), e2++;
    e2 < s2.length && (this._$AR(i2 && i2._$AB.nextSibling, e2), s2.length = e2);
  }
  _$AR(t3 = this._$AA.nextSibling, s2) {
    for (this._$AP?.(false, true, s2); t3 !== this._$AB; ) {
      const s3 = t3.nextSibling;
      t3.remove(), t3 = s3;
    }
  }
  setConnected(t3) {
    void 0 === this._$AM && (this.D = t3, this._$AP?.(t3));
  }
};
var ht = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t3, s2, i2, e2, h2) {
    this.type = 1, this._$AH = G, this._$AN = void 0, this.element = t3, this.name = s2, this._$AM = e2, this.options = h2, i2.length > 2 || "" !== i2[0] || "" !== i2[1] ? (this._$AH = Array(i2.length - 1).fill(new String()), this.strings = i2) : this._$AH = G;
  }
  _$AI(t3, s2 = this, i2, e2) {
    const h2 = this.strings;
    let o2 = false;
    if (void 0 === h2) t3 = st(this, t3, s2, 0), o2 = !N(t3) || t3 !== this._$AH && t3 !== F, o2 && (this._$AH = t3);
    else {
      const e3 = t3;
      let r2, n2;
      for (t3 = h2[0], r2 = 0; r2 < h2.length - 1; r2++) n2 = st(this, e3[i2 + r2], s2, r2), n2 === F && (n2 = this._$AH[r2]), o2 || (o2 = !N(n2) || n2 !== this._$AH[r2]), n2 === G ? t3 = G : t3 !== G && (t3 += (n2 ?? "") + h2[r2 + 1]), this._$AH[r2] = n2;
    }
    o2 && !e2 && this.W(t3);
  }
  W(t3) {
    t3 === G ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
};
var ot = class extends ht {
  constructor() {
    super(...arguments), this.type = 3;
  }
  W(t3) {
    this.element[this.name] = t3 === G ? void 0 : t3;
  }
};
var rt = class extends ht {
  constructor() {
    super(...arguments), this.type = 4;
  }
  W(t3) {
    this.element.toggleAttribute(this.name, !!t3 && t3 !== G);
  }
};
var nt = class extends ht {
  constructor(t3, s2, i2, e2, h2) {
    super(t3, s2, i2, e2, h2), this.type = 5;
  }
  _$AI(t3, s2 = this) {
    if ((t3 = st(this, t3, s2, 0) ?? G) === F) return;
    const i2 = this._$AH, e2 = t3 === G && i2 !== G || t3.capture !== i2.capture || t3.once !== i2.once || t3.passive !== i2.passive, h2 = t3 !== G && (i2 === G || e2);
    e2 && this.element.removeEventListener(this.name, this, i2), h2 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var ct = class {
  constructor(t3, s2, i2) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = s2, this.options = i2;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    st(this, t3);
  }
};
var lt = P.litHtmlPolyfillSupport;
lt?.(tt, et), (P.litHtmlVersions ?? (P.litHtmlVersions = [])).push("3.3.1");
var ut = (t3, s2, i2) => {
  const e2 = i2?.renderBefore ?? s2;
  let h2 = e2._$litPart$;
  if (void 0 === h2) {
    const t4 = i2?.renderBefore ?? null;
    e2._$litPart$ = h2 = new et(s2.insertBefore(U(), t4), t4, void 0, i2 ?? {});
  }
  return h2._$AI(t3), h2;
};
var dt = globalThis;
var ft = class extends $ {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this.rt = void 0;
  }
  createRenderRoot() {
    var _a;
    const t3 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t3.firstChild), t3;
  }
  update(t3) {
    const s2 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this.rt = ut(s2, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this.rt?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.rt?.setConnected(false);
  }
  render() {
    return F;
  }
};
ft._$litElement$ = true, ft["finalized"] = true, dt.litElementHydrateSupport?.({ LitElement: ft });
var pt = dt.litElementPolyfillSupport;
pt?.({ LitElement: ft });
(dt.litElementVersions ?? (dt.litElementVersions = [])).push("4.2.1");

// dh-utils.js
var DEFAULT_LAYOUT_BASE_WIDTH = 400;
var DEFAULT_CONTROLS_MAX_WIDTH = 520;
var TARGET_SYNC_GRACE_MS = 1800;
function toFiniteNumber(value, fallback = 0) {
  const num2 = Number(value);
  return Number.isFinite(num2) ? num2 : fallback;
}
function toPositiveNumber(value, fallback, min = 1) {
  return Math.max(min, toFiniteNumber(value, fallback));
}
function clamp(value, min, max) {
  return Math.min(Math.max(toFiniteNumber(value, min), min), max);
}
function layoutUnit(value, layoutBaseWidth = DEFAULT_LAYOUT_BASE_WIDTH) {
  const base = toPositiveNumber(layoutBaseWidth, DEFAULT_LAYOUT_BASE_WIDTH);
  return `${toFiniteNumber(value, 0) / base * 100}cqw`;
}
function getEntityState(card, entityId) {
  return entityId ? card?._hass?.states?.[entityId] : void 0;
}
function readNumberState(card, entityId) {
  const stateObj = getEntityState(card, entityId);
  if (!stateObj) return null;
  const raw = Number(stateObj.state);
  return Number.isFinite(raw) ? raw : null;
}
function isEntityOn(card, entityId) {
  return getEntityState(card, entityId)?.state === "on";
}
function isMainEntityOn(card, entityId) {
  const state = getEntityState(card, entityId)?.state;
  return !!state && state !== "off" && state !== "unavailable" && state !== "unknown";
}
function callHA(card, domain, service, data = {}) {
  if (!card?._hass) return;
  card._hass.callService(domain, service, data);
}
function readHumidityTarget(card, entityId, fallback = 50) {
  const attrs = getEntityState(card, entityId)?.attributes || {};
  if (attrs.target_humidity !== void 0) return clamp(attrs.target_humidity, 0, 100);
  if (attrs.humidity !== void 0) return clamp(attrs.humidity, 0, 100);
  return clamp(fallback, 0, 100);
}
function readCurrentHumidity(card, config = {}, fallback = 50) {
  const hass = card?._hass;
  const currentEntity = config.current_humidity_entity || config.humidity_entity || config.current_entity;
  if (currentEntity && hass?.states?.[currentEntity]) {
    return clamp(hass.states[currentEntity].state, 0, 100);
  }
  const attrs = getEntityState(card, config.entity)?.attributes || {};
  if (attrs.current_humidity !== void 0) return clamp(attrs.current_humidity, 0, 100);
  if (attrs.humidity !== void 0) return clamp(attrs.humidity, 0, 100);
  return clamp(fallback, 0, 100);
}
function formatElapsedSince(lastChanged, now = Date.now()) {
  if (!lastChanged) return null;
  const startedAt = new Date(lastChanged).getTime();
  if (!Number.isFinite(startedAt)) return null;
  const diffSecs = Math.max(0, Math.floor((now - startedAt) / 1e3));
  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor(diffSecs % 3600 / 60);
  const seconds = diffSecs % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
var SD_LOG_MAX = 250;
function sdLog(level, ...args) {
  try {
    if (typeof window !== "undefined") {
      window.__SD_LOGS__ = window.__SD_LOGS__ || [];
      window.__SD_LOGS__.push({
        t: (/* @__PURE__ */ new Date()).toISOString(),
        level,
        msg: args.map((a2) => {
          try {
            if (a2 instanceof Error) return a2.message;
            if (typeof a2 === "object") return JSON.stringify(a2);
            return String(a2);
          } catch (_e) {
            return String(a2);
          }
        }).join(" ")
      });
      if (window.__SD_LOGS__.length > SD_LOG_MAX) {
        window.__SD_LOGS__.splice(0, window.__SD_LOGS__.length - SD_LOG_MAX);
      }
    }
  } catch (_e) {
  }
  const fn = console[level] || console.log;
  fn.call(console, "[SmartDehumidifier]", ...args);
}
function resolveSdEntities(hass, config = {}) {
  const out = {
    entity: "",
    fan_entity: "",
    current_humidity_entity: "",
    room_humidity_entity: "",
    status_entity: "",
    auto_entity: "",
    calc_entity: "",
    manual_script_entity: "",
    delta_entity: "",
    min_rh_entity: "",
    max_rh_entity: "",
    manual_runtime_entity: "",
    manual_pause_runtime_entity: ""
  };
  if (!hass) {
    for (const k2 of Object.keys(out)) {
      if (config[k2]) out[k2] = config[k2];
    }
    return out;
  }
  try {
    const registry = hass.entities || {};
    const states = hass.states || {};
    const isOurs = (entityId, info = {}) => {
      const platform = String(info.platform || "");
      const uid = String(info.unique_id || "");
      return platform === "smart_dehumidifier" || uid.includes("smart_dehumidifier") || /smart_dehumidifier/i.test(entityId);
    };
    const statusCandidates = [];
    for (const entityId of Object.keys(states)) {
      if (!entityId.startsWith("sensor.")) continue;
      const info = registry[entityId] || {};
      const oid = entityId.split(".").slice(1).join(".");
      if (!isOurs(entityId, info) && !/_status$/i.test(oid)) continue;
      if (!/status$/i.test(oid) && !String(info.unique_id || "").endsWith("_status")) continue;
      statusCandidates.push(entityId);
    }
    let statusId = "";
    for (const id of statusCandidates) {
      const attrs2 = states[id]?.attributes || {};
      if (attrs2.humidifier_entity) {
        statusId = id;
        break;
      }
    }
    if (!statusId && statusCandidates.length) statusId = statusCandidates[0];
    out.status_entity = statusId;
    const attrs = statusId ? states[statusId]?.attributes || {} : {};
    out.entity = attrs.humidifier_entity || "";
    out.fan_entity = attrs.fan_entity || "";
    out.current_humidity_entity = attrs.bathroom_humidity_entity || "";
    out.room_humidity_entity = attrs.room_humidity_entity || "";
    out.auto_entity = attrs.auto_entity || "";
    out.calc_entity = attrs.recommended_entity || "";
    out.delta_entity = attrs.delta_entity || "";
    out.min_rh_entity = attrs.min_rh_entity || "";
    out.max_rh_entity = attrs.max_rh_entity || "";
    out.manual_runtime_entity = attrs.manual_runtime_entity || "";
    out.manual_pause_runtime_entity = attrs.pause_runtime_entity || "";
    const statusInfo = statusId ? registry[statusId] || {} : {};
    const deviceId = statusInfo.device_id || null;
    const matchers = [
      { key: "manual_runtime_entity", re: /(?:^|[._-])manual_runtime$/i },
      { key: "manual_pause_runtime_entity", re: /(?:^|[._-])pause_runtime$/i },
      { key: "min_rh_entity", re: /(?:^|[._-])(?:auto_)?min_rh$/i },
      { key: "max_rh_entity", re: /(?:^|[._-])(?:auto_)?max_rh$/i },
      { key: "calc_entity", re: /(?:^|[._-])recommended$/i },
      { key: "manual_script_entity", re: /(?:^|[._-])manual_toggle$/i },
      { key: "delta_entity", re: /(?:^|[._-])delta$/i },
      { key: "auto_entity", re: /(?:^|[._-])auto$/i }
    ];
    const objectId = (entityId) => {
      const parts = String(entityId).split(".");
      return parts.length > 1 ? parts.slice(1).join(".") : String(entityId);
    };
    for (const [entityId, info] of Object.entries(registry)) {
      if (!isOurs(entityId, info) && !(deviceId && info.device_id === deviceId)) continue;
      if (deviceId && info.device_id && info.device_id !== deviceId && info.platform !== "smart_dehumidifier") {
        continue;
      }
      const oid = objectId(entityId);
      const uid = String(info.unique_id || "");
      for (const { key, re } of matchers) {
        if (out[key]) continue;
        if (re.test(oid) || re.test(uid)) {
          if (key === "auto_entity" && /min_rh|max_rh/i.test(oid)) continue;
          out[key] = entityId;
        }
      }
    }
    for (const k2 of Object.keys(out)) {
      if (config[k2]) out[k2] = config[k2];
    }
    sdLog("debug", "resolveSdEntities", {
      status: out.status_entity,
      entity: out.entity,
      auto: out.auto_entity,
      delta: out.delta_entity,
      room: out.room_humidity_entity
    });
  } catch (err) {
    sdLog("error", "resolveSdEntities failed", err);
    for (const k2 of Object.keys(out)) {
      if (config[k2]) out[k2] = config[k2];
    }
  }
  return out;
}

// components/arc-slider.js
var SVG_W = 320;
var SVG_H = 310;
var CX = 160;
var CY = 165;
var FRAME_MS = 33;
function normalizeAngle(deg) {
  return (deg % 360 + 360) % 360;
}
function clockwiseDistance(fromDeg, toDeg) {
  return normalizeAngle(toDeg - fromDeg);
}
function polar(deg, cx = CX, cy = CY, r2 = 0) {
  const rad = (deg - 90) * Math.PI / 180;
  return [cx + r2 * Math.cos(rad), cy + r2 * Math.sin(rad)];
}
function arcPath(a1, a2, cx = CX, cy = CY, r2 = 0) {
  if (Math.abs(a2 - a1) < 0.01) return "M0 0";
  const p1 = polar(a1, cx, cy, r2);
  const p2 = polar(a2, cx, cy, r2);
  const largeArc = a2 - a1 > 180 ? 1 : 0;
  return `M${p1[0].toFixed(2)} ${p1[1].toFixed(2)} A${r2} ${r2} 0 ${largeArc} 1 ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
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
  if (Math.abs(distToStart - distToEnd) < 1e-3) {
    return clamp(preferProgress, 0, 1);
  }
  return distToStart < distToEnd ? 0 : 1;
}
function isAutoEnabled(card, config) {
  const entityId = config.auto_entity;
  return card?._hass?.states?.[entityId]?.state === "on";
}
function disableAutoAndHide(card, config) {
  const entityId = config.auto_entity;
  if (isAutoEnabled(card, config)) {
    card._hass?.callService("input_boolean", "turn_off", {
      entity_id: entityId
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
    arc_start: config.arc_start !== void 0 ? config.arc_start : 225,
    arc_span: config.arc_span !== void 0 ? config.arc_span : 270,
    arc_radius: config.arc_radius !== void 0 ? config.arc_radius : 300,
    arc_bg_color: config.arc_bg_color || "rgba(255,255,255,0.08)",
    arc_cur_color: config.arc_cur_color || "rgba(255,255,255,0.14)",
    arc_tgt_color_on: config.arc_tgt_color_on || "var(--state-humidifier-color, #00bfff)",
    arc_tgt_color_off: config.arc_tgt_color_off || "rgba(100,160,255,0.55)",
    arc_bg_width: config.arc_bg_width !== void 0 ? config.arc_bg_width : 40,
    arc_cur_width: config.arc_cur_width !== void 0 ? config.arc_cur_width : 40,
    arc_tgt_width: config.arc_tgt_width !== void 0 ? config.arc_tgt_width : 40,
    arc_glow: config.arc_glow !== void 0 ? config.arc_glow : true,
    dot_radius: config.dot_radius !== void 0 ? config.dot_radius : 30,
    dot_hit_radius: config.dot_hit_radius !== void 0 ? config.dot_hit_radius : 40,
    dot_ring_color_on: config.dot_ring_color_on || "rgba(100,200,255,.7)",
    dot_ring_color_off: config.dot_ring_color_off || "rgba(255,255,255,.25)",
    dot_glow: config.dot_glow !== void 0 ? config.dot_glow : true
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
  const targetDeg = start + tgt / 100 * span;
  const currentDeg = cur > 0 ? start + cur / 100 * span : start;
  const result = {
    bgPath: arcPath(start, end - 0.05, CX, CY, radius),
    curPath: cur > 0 ? arcPath(start, Math.min(currentDeg, end - 0.1), CX, CY, radius) : "M0 0",
    tgtPath: arcPath(Math.min(targetDeg + 0.1, end - 0.1), end - 0.05, CX, CY, radius),
    dotPos: polar(targetDeg, CX, CY, radius)
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
    card._hass.callService("humidifier", "set_humidity", {
      entity_id: config.entity,
      humidity: finalValue
    });
  }
}
function onArcPointerMove(card, config, arcConfig, event) {
  if (!card || !card._dragging) return;
  event.preventDefault();
  const now = performance.now();
  if (card._lastFrameTime && now - card._lastFrameTime < FRAME_MS) return;
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
  if (card._captureEl && typeof card._captureEl.releasePointerCapture === "function" && event.pointerId) {
    card._captureEl.releasePointerCapture(event.pointerId);
  }
  document.removeEventListener("pointermove", card._boundArcMove);
  document.removeEventListener("pointerup", card._boundArcUp);
  document.removeEventListener("pointercancel", card._boundArcUp);
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
    card._arcSvgEl = card.shadowRoot ? card.shadowRoot.querySelector("#dh-arc-svg") : null;
    card._svgRectCache = card._arcSvgEl ? card._arcSvgEl.getBoundingClientRect() : null;
    card._dragging = true;
    let currentTgt = card._targetHumidity;
    if (currentTgt === void 0 || currentTgt === null) {
      currentTgt = readHumidityTarget(card, config.entity, 50);
    }
    card._dragStartVal = currentTgt;
    card._captureEl = event.currentTarget;
    if (card._captureEl && typeof card._captureEl.setPointerCapture === "function" && event.pointerId) {
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
    card._boundArcMove = (e2) => onArcPointerMove(card, config, arcConfig, e2);
    card._boundArcUp = (e2) => onArcPointerUp(card, config, e2);
    document.addEventListener("pointermove", card._boundArcMove, { passive: false });
    document.addEventListener("pointerup", card._boundArcUp);
    document.addEventListener("pointercancel", card._boundArcUp);
    card.requestUpdate();
  };
}
function renderArcSlider(card, config = {}) {
  const arcConfig = getArcConfig(config);
  if (card._targetHumidity === null || card._targetHumidity === void 0) {
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
  const dotXpct = arc.dotPos[0] / SVG_W * 100;
  const dotYpct = arc.dotPos[1] / SVG_H * 100;
  const rPctX = arcConfig.dot_hit_radius / SVG_W * 100;
  const rPctY = arcConfig.dot_hit_radius / SVG_H * 100;
  return q`
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
        <svg class="dh-arc-svg ${card._dragging ? "is-dragging" : ""}" viewBox="0 0 320 310" id="dh-arc-svg">
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
            style="${arcConfig.arc_glow && isOn && !card._dragging ? "filter:url(#dh-fg)" : ""}"
          ></path>

          <g class="dh-dot-group" style="pointer-events: none;">
            <circle
              cx="${arc.dotPos[0]}"
              cy="${arc.dotPos[1]}"
              r="${arcConfig.dot_radius + 6}"
              fill="${isOn ? activeArcColor : "transparent"}"
              opacity="0.4"
              style="${arcConfig.dot_glow && isOn && !card._dragging ? "filter:url(#dh-fd)" : ""}"
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
              fill="${isOn ? activeArcColor : "rgba(150,160,180,0.5)"}"
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

// components/current-humidity.js
if (!document.getElementById("sd-7seg-font")) {
  const fontUrl = new URL("../fonts/7segment.woff", import.meta.url).href;
  const fontStyle = document.createElement("style");
  fontStyle.id = "sd-7seg-font";
  fontStyle.textContent = `
    @font-face {
      font-family: '7segment';
      src: url('${fontUrl}') format('woff');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(fontStyle);
}
var DEFAULT_HUMIDITY = 50;
function splitHumidity(value) {
  const rounded = Math.round(toFiniteNumber(value, DEFAULT_HUMIDITY) * 10);
  const intPart = Math.trunc(rounded / 10);
  const decPart = Math.abs(rounded % 10);
  return {
    intText: String(intPart),
    decText: String(decPart),
    hasDecimal: decPart !== 0
  };
}
function getHumidityInfoEntity(config = {}) {
  return config.current_humidity_entity || config.current_entity || config.humidity_entity || null;
}
function openMoreInfo(card, entityId) {
  if (!entityId) return;
  card.dispatchEvent(
    new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId }
    })
  );
}
function renderCurrentHumidity(card, config = {}) {
  if (!(config.show_current ?? true)) return q``;
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
  const curColorOn = config.cur_color_on ?? "white";
  const curColorOff = config.cur_color_off ?? "rgba(255,255,255,0.38)";
  const curDecColorOn = config.cur_dec_color_on ?? curColorOn;
  const curDecColorOff = config.cur_dec_color_off ?? curColorOff;
  const curUnitColorOn = config.cur_unit_color_on ?? "rgba(255,255,255,0.60)";
  const curUnitColorOff = config.cur_unit_color_off ?? "rgba(255,255,255,0.26)";
  const curGlowOn = config.cur_glow_on ?? "-1px -1px 1px rgba(255,255,255,0.4), 1px 1px 1px rgba(0,0,0,0.6), 0 0 10px rgba(255,255,255,0.4)";
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
  const mainShadow = isOn ? curGlowOn : "none";
  const unitShadow = isOn ? "0 0 10px rgba(255,255,255,0.15)" : "none";
  return q`
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
        cursor: ${infoEntityId ? "pointer" : "default"};
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
          title="${infoEntityId ? "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 \u0432\u043B\u0430\u0441\u0442\u0438\u0432\u043E\u0441\u0442\u0456 \u0434\u0430\u0442\u0447\u0438\u043A\u0430" : ""}"
          @pointerdown=${(e2) => e2.stopPropagation()}
          @click=${(e2) => {
    e2.stopPropagation();
    openMoreInfo(card, infoEntityId);
  }}
        >
          <span class="dh-cur-int">${value.intText}</span>

          ${curShowDecimal && value.hasDecimal ? q`<span class="dh-cur-dec">.${value.decText}</span>` : q``}

          ${curShowUnit ? q`<span class="dh-cur-unit">%</span>` : q``}
        </button>
      </div>
    </div>
  `;
}

// i18n.js
var STRINGS = {
  uk: {
    auto: "\u0410\u0432\u0442\u043E",
    auto_humidity: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0430 \u0432\u043E\u043B\u043E\u0433\u0456\u0441\u0442\u044C",
    manual: "\u0420\u0443\u0447\u043D\u0438\u0439",
    pause: "\u041F\u0430\u0443\u0437\u0430",
    off: "\u0412\u0438\u043C\u043A\u043D\u0435\u043D\u043E",
    on: "\u0423\u0432\u0456\u043C\u043A\u043D\u0435\u043D\u043E",
    settings: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F",
    timers: "\u0422\u0430\u0439\u043C\u0435\u0440\u0438",
    language: "\u041C\u043E\u0432\u0430",
    auto_panel: "\u0410\u0432\u0442\u043E\u043F\u0430\u043D\u0435\u043B\u044C",
    offset_x: "\u0417\u043C\u0456\u0449\u0435\u043D\u043D\u044F \u043F\u043E X",
    offset_y: "\u0417\u043C\u0456\u0449\u0435\u043D\u043D\u044F \u043F\u043E Y",
    arc: "\u0414\u0443\u0433\u0430",
    arc_radius: "\u0420\u0430\u0434\u0456\u0443\u0441 \u0434\u0443\u0433\u0438",
    delta: "\u0414\u0435\u043B\u044C\u0442\u0430 (\u0434\u043E \u043A\u0456\u043C\u043D\u0430\u0442\u0438)",
    min_rh: "\u041C\u0456\u043D. \u0446\u0456\u043B\u044C %",
    max_rh: "\u041C\u0430\u043A\u0441. \u0446\u0456\u043B\u044C %",
    recommended: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u043E\u0432\u0430\u043D\u043E",
    runtime: "\u0420\u0443\u0447\u043D\u0438\u0439 \u0440\u0435\u0436\u0438\u043C",
    pause_time: "\u041F\u0430\u0443\u0437\u0430",
    min: "\u0445\u0432",
    room_hint: "\u0410\u0432\u0442\u043E: \u043A\u0456\u043C\u043D\u0430\u0442\u0430 + \u0434\u0435\u043B\u044C\u0442\u0430",
    bath_hint: "\u0410\u0432\u0442\u043E: \u043B\u0438\u0448\u0435 \u0432\u0430\u043D\u043D\u0430",
    beta: "\u0411\u0435\u0442\u0430 \u2014 \u0449\u0435 \u043D\u0430\u043B\u0430\u0448\u0442\u043E\u0432\u0443\u0454\u0442\u044C\u0441\u044F",
    entities_missing: "\u041D\u0435 \u0437\u043D\u0430\u0439\u0434\u0435\u043D\u043E entity \u0456\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0456\u0457. \u041F\u0435\u0440\u0435\u0432\u0456\u0440 Smart Dehumidifier \u043D\u0430 \u0441\u0442\u043E\u0440\u0456\u043D\u0446\u0456 \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u044E.",
    ed_entities: "\u0421\u0443\u0442\u043D\u043E\u0441\u0442\u0456",
    ed_auto_humidity: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0430 \u0432\u043E\u043B\u043E\u0433\u0456\u0441\u0442\u044C (\u0434\u0438\u0437\u0430\u0439\u043D)",
    ed_layout: "\u0420\u043E\u0437\u043A\u043B\u0430\u0434\u043A\u0430",
    ed_arc: "\u0414\u0443\u0433\u0430 \u0442\u0430 \u043F\u043E\u0432\u0437\u0443\u043D\u043E\u043A",
    ed_humidity: "\u041F\u043E\u0442\u043E\u0447\u043D\u0430 \u0432\u043E\u043B\u043E\u0433\u0456\u0441\u0442\u044C",
    ed_target: "\u041F\u0430\u043D\u0435\u043B\u044C \u0446\u0456\u043B\u044C\u043E\u0432\u043E\u0457 \u0432\u043E\u043B\u043E\u0433\u043E\u0441\u0442\u0456",
    ed_buttons: "\u041D\u0438\u0436\u043D\u0456 \u043A\u043D\u043E\u043F\u043A\u0438",
    ed_effects: "\u0412\u0456\u0437\u0443\u0430\u043B\u044C\u043D\u0456 \u0435\u0444\u0435\u043A\u0442\u0438",
    align_left: "\u041B\u0456\u0432\u043E\u0440\u0443\u0447",
    align_center: "\u041F\u043E \u0446\u0435\u043D\u0442\u0440\u0443",
    align_right: "\u041F\u0440\u0430\u0432\u043E\u0440\u0443\u0447"
  },
  ru: {
    auto: "\u0410\u0432\u0442\u043E",
    auto_humidity: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u044C",
    manual: "\u0420\u0443\u0447\u043D\u043E\u0439",
    pause: "\u041F\u0430\u0443\u0437\u0430",
    off: "\u0412\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E",
    on: "\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E",
    settings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    timers: "\u0422\u0430\u0439\u043C\u0435\u0440\u044B",
    language: "\u042F\u0437\u044B\u043A",
    auto_panel: "\u0410\u0432\u0442\u043E\u043F\u0430\u043D\u0435\u043B\u044C",
    offset_x: "\u0421\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043F\u043E X",
    offset_y: "\u0421\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043F\u043E Y",
    arc: "\u0414\u0443\u0433\u0430",
    arc_radius: "\u0420\u0430\u0434\u0438\u0443\u0441 \u0434\u0443\u0433\u0438",
    delta: "\u0414\u0435\u043B\u044C\u0442\u0430 (\u043A \u043A\u043E\u043C\u043D\u0430\u0442\u0435)",
    min_rh: "\u041C\u0438\u043D. \u0446\u0435\u043B\u044C %",
    max_rh: "\u041C\u0430\u043A\u0441. \u0446\u0435\u043B\u044C %",
    recommended: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F",
    runtime: "\u0420\u0443\u0447\u043D\u043E\u0439 \u0440\u0435\u0436\u0438\u043C",
    pause_time: "\u041F\u0430\u0443\u0437\u0430",
    min: "\u043C\u0438\u043D",
    room_hint: "\u0410\u0432\u0442\u043E: \u043A\u043E\u043C\u043D\u0430\u0442\u0430 + \u0434\u0435\u043B\u044C\u0442\u0430",
    bath_hint: "\u0410\u0432\u0442\u043E: \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u0430\u043D\u043D\u0430\u044F",
    beta: "\u0411\u0435\u0442\u0430 \u2014 \u0435\u0449\u0451 \u043D\u0430\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0435\u0442\u0441\u044F",
    entities_missing: "\u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B entity \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 Smart Dehumidifier \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430.",
    ed_entities: "\u0421\u0443\u0449\u043D\u043E\u0441\u0442\u0438",
    ed_auto_humidity: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u044C (\u0434\u0438\u0437\u0430\u0439\u043D)",
    ed_layout: "\u0420\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0430",
    ed_arc: "\u0414\u0443\u0433\u0430 \u0438 \u043F\u043E\u043B\u0437\u0443\u043D\u043E\u043A",
    ed_humidity: "\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u044C",
    ed_target: "\u041F\u0430\u043D\u0435\u043B\u044C \u0446\u0435\u043B\u0435\u0432\u043E\u0439 \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u0438",
    ed_buttons: "\u041D\u0438\u0436\u043D\u0438\u0435 \u043A\u043D\u043E\u043F\u043A\u0438",
    ed_effects: "\u0412\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u044B\u0435 \u044D\u0444\u0444\u0435\u043A\u0442\u044B",
    align_left: "\u0421\u043B\u0435\u0432\u0430",
    align_center: "\u041F\u043E \u0446\u0435\u043D\u0442\u0440\u0443",
    align_right: "\u0421\u043F\u0440\u0430\u0432\u0430"
  },
  en: {
    auto: "Auto",
    auto_humidity: "Automatic humidity",
    manual: "Manual",
    pause: "Pause",
    off: "Off",
    on: "On",
    settings: "Settings",
    timers: "Timers",
    language: "Language",
    auto_panel: "Auto panel",
    offset_x: "Offset X",
    offset_y: "Offset Y",
    arc: "Arc",
    arc_radius: "Arc radius",
    delta: "Delta (vs room)",
    min_rh: "Min target %",
    max_rh: "Max target %",
    recommended: "Recommended",
    runtime: "Manual mode",
    pause_time: "Pause",
    min: "min",
    room_hint: "Auto: room + delta",
    bath_hint: "Auto: bathroom only",
    beta: "Beta \u2014 still being tuned",
    entities_missing: "Integration entities not found. Check Smart Dehumidifier on the device page.",
    ed_entities: "Entities",
    ed_auto_humidity: "Automatic humidity (design)",
    ed_layout: "Layout",
    ed_arc: "Arc & slider",
    ed_humidity: "Current humidity",
    ed_target: "Target humidity panel",
    ed_buttons: "Bottom buttons",
    ed_effects: "Visual effects",
    align_left: "Left",
    align_center: "Center",
    align_right: "Right"
  }
};
function getLang(hass, config) {
  const forced = config && (config.language || config.lang) || null;
  if (forced && STRINGS[forced]) return forced;
  try {
    const stored = localStorage.getItem("sd_card_lang");
    if (stored && STRINGS[stored]) return stored;
  } catch (_e) {
  }
  return "uk";
}
function t2(hass, key, config) {
  const lang = getLang(hass, config);
  return STRINGS[lang] && STRINGS[lang][key] || STRINGS.en[key] || key;
}

// components/humidity-panel.js
var PANEL_BASE_WIDTH = 240;
var DEFAULT_TARGET = 50;
var DEFAULT_AUTO_CLOSE_MS = 2200;
function panelUnit(value) {
  return `${toFiniteNumber(value, 0) / PANEL_BASE_WIDTH * 100}cqw`;
}
function readTargetState(card, config, fallback = DEFAULT_TARGET) {
  if (card._targetHumidity !== void 0 && card._targetHumidity !== null && (card._dragging || Date.now() < (card._ignoreStateUntil || 0))) {
    return {
      isOn: isMainEntityOn(card, config?.entity),
      targetHumidity: clamp(card._targetHumidity, 0, 100)
    };
  }
  const stateObj = getEntityState(card, config?.entity);
  const attrs = stateObj?.attributes || {};
  let targetHumidity = fallback;
  if (attrs.target_humidity !== void 0) targetHumidity = attrs.target_humidity;
  else if (attrs.humidity !== void 0) targetHumidity = attrs.humidity;
  const finalTarget = clamp(targetHumidity, 0, 100);
  card._targetHumidity = finalTarget;
  return {
    isOn: isMainEntityOn(card, config?.entity),
    targetHumidity: finalTarget
  };
}
function resolvedConfig(card, config) {
  const hass = card?._hass;
  const base = config || {};
  if (!hass) return base;
  const resolved = resolveSdEntities(hass, base);
  return { ...base, ...resolved };
}
function isAutoModeAvailable(card, config) {
  const cfg = resolvedConfig(card, config);
  if (cfg.room_humidity_entity && getEntityState(card, cfg.room_humidity_entity)) {
    return true;
  }
  const statusId = cfg.status_entity;
  const st2 = statusId ? getEntityState(card, statusId) : null;
  if (st2?.attributes?.auto_available === true) return true;
  if (st2?.attributes?.auto_available === false) return false;
  if (cfg.auto_entity && getEntityState(card, cfg.auto_entity)) return true;
  if (cfg.delta_entity && getEntityState(card, cfg.delta_entity)) return true;
  return false;
}
function isAutoEnabled2(card, config) {
  if (!isAutoModeAvailable(card, config)) return false;
  const cfg = resolvedConfig(card, config);
  const entityId = cfg.auto_entity;
  return getEntityState(card, entityId)?.state === "on";
}
function setAutoEnabled(card, config, enabled) {
  if (!isAutoModeAvailable(card, config)) return;
  const cfg = resolvedConfig(card, config);
  const entityId = cfg.auto_entity;
  if (!entityId) return;
  const domain = String(entityId).split(".")[0] || "switch";
  callHA(card, domain, enabled ? "turn_on" : "turn_off", {
    entity_id: entityId
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
    if (isAutoEnabled2(card, config)) return;
    card._humPanelAutoPopupOpen = false;
    card.requestUpdate();
  }, delay);
}
function showAutoPopup(card, config) {
  card._humPanelAutoPopupOpen = true;
  card.requestUpdate();
  if (!isAutoEnabled2(card, config)) {
    scheduleAutoPopupClose(card, config);
  } else {
    clearAutoPopupTimer(card);
  }
}
function disableAutoAndHide2(card, config) {
  if (isAutoEnabled2(card, config)) {
    setAutoEnabled(card, config, false);
  }
  hideAutoPopup(card);
}
function setTarget(card, config, value) {
  const nextValue = clamp(Math.round(value), 0, 100);
  if (!config?.entity) return;
  disableAutoAndHide2(card, config);
  card._targetHumidity = nextValue;
  card._ignoreStateUntil = Date.now() + 1800;
  card.requestUpdate();
  callHA(card, "humidifier", "set_humidity", {
    entity_id: config.entity,
    humidity: nextValue
  });
}
function quickAdjustTarget(card, config, delta) {
  const current = readTargetState(card, config, DEFAULT_TARGET).targetHumidity;
  setTarget(card, config, current + delta);
}
function formatRecommendedHumidity(value) {
  if (!Number.isFinite(value)) return "--%";
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
  const autoShow = (config.auto_ui_show ?? true) && isAutoModeAvailable(card, config);
  if (!autoShow) return;
  if (isAutoEnabled2(card, config)) {
    disableAutoAndHide2(card, config);
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
    disableAutoAndHide2(card, config);
    return;
  }
  setAutoEnabled(card, config, true);
  const cfgR = resolvedConfig(card, config);
  const calcEntity = cfgR.calc_entity || config.calc_entity;
  const recommendedRh = readNumberState(card, calcEntity);
  if (Number.isFinite(recommendedRh)) {
    card._targetHumidity = Math.round(clamp(recommendedRh, 0, 100));
    card._ignoreStateUntil = Date.now() + 1800;
  }
  card._humPanelAutoPopupOpen = true;
  clearAutoPopupTimer(card);
  card.requestUpdate();
}
function renderHumidityPanel(card, config = {}) {
  if (config.show_hum_panel === false) return q``;
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
  const tgtFontFamily = config.tgt_font_family || "inherit";
  const tgtFontWeight = toFiniteNumber(config.tgt_font_weight, 700);
  const normalTargetColor = config.arc_tgt_color_on || config.tgt_color_on || "var(--state-humidifier-color, #00bfff)";
  const tgtColorOff = config.tgt_color_off || "rgba(255,255,255,0.28)";
  const tgtGlowOn = config.tgt_glow_on || "0 0 12px rgba(0,200,255,.5)";
  const showTgtLabel = config.show_tgt_label ?? false;
  const tgtLabelText = config.tgt_label_text || "\u0426\u0456\u043B\u044C";
  const tgtLabelSize = toPositiveNumber(config.tgt_label_size, 9);
  const panelBottom = toFiniteNumber(config.hum_panel_bottom, 110);
  const autoShow = (config.auto_ui_show ?? true) && isAutoModeAvailable(card, config);
  const autoAccentColor = config.auto_ui_color || "#7fc8ff";
  const autoPopupBg = config.auto_ui_popup_bg || "linear-gradient(145deg, #2d3945 0%, #182029 100%)";
  const autoPopupBgActive = config.auto_ui_popup_bg_active || "linear-gradient(145deg, #20394d 0%, #152433 100%)";
  const autoPopupIcon = config.auto_ui_icon || "mdi:water-percent";
  const autoLabelText = config.auto_ui_label_text || t2(card._hass, "auto", config);
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
  const autoArrowColor = config.auto_ui_arrow_color || "rgba(255,255,255,0.56)";
  const autoArrowBg = config.auto_ui_arrow_bg || "linear-gradient(180deg, rgba(56,64,76,0.95) 0%, rgba(26,31,38,0.95) 100%)";
  const autoPopupOpen = !!card._humPanelAutoPopupOpen;
  const autoEnabled = isAutoEnabled2(card, config);
  const cfgR = resolvedConfig(card, config);
  const calcEntity = cfgR.calc_entity || config.calc_entity;
  const recommendedRh = readNumberState(card, calcEntity);
  const stateData = readTargetState(card, config, DEFAULT_TARGET);
  const isOn = stateData.isOn;
  const targetValue = stateData.targetHumidity;
  const displayAutoValue = formatRecommendedHumidity(recommendedRh);
  const targetMainColor = autoEnabled ? autoAccentColor : isOn ? normalTargetColor : tgtColorOff;
  const targetMainShadow = autoEnabled ? "0 0 12px rgba(127, 200, 255, 0.34)" : isOn ? tgtGlowOn : "none";
  const canRecommendAuto = Number.isFinite(recommendedRh);
  return q`
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
        display: ${autoShow ? "flex" : "none"};
        align-items: center;
        justify-content: center;
        cursor: pointer;
        pointer-events: auto;
        color: ${autoEnabled ? autoAccentColor : autoPopupOpen ? autoAccentColor : autoArrowColor};
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
        pointer-events: ${autoPopupOpen || autoEnabled ? "auto" : "none"};
        opacity: ${autoPopupOpen || autoEnabled ? 1 : 0};
        color: ${autoEnabled ? autoAccentColor : "rgba(255,255,255,0.76)"};
        background: ${autoEnabled ? autoPopupBgActive : autoPopupBg};
        box-shadow:
          0 0 0 ${panelUnit(2)} #0f1318,
          0 ${panelUnit(7)} ${panelUnit(14)} rgba(0,0,0,0.42),
          inset 0 ${panelUnit(2)} ${panelUnit(2)} rgba(255,255,255,0.12),
          inset 0 ${panelUnit(-2)} ${panelUnit(4)} rgba(0,0,0,0.35);
        transition: opacity 0.22s ease, transform 0.22s ease, color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
        transform: scale(${autoPopupOpen || autoEnabled ? 1 : 0.92});
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
        color: ${autoEnabled ? autoAccentColor : "rgba(255,255,255,0.35)"};
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

    ${autoShow ? q`
      <div class="dh-auto-popup-anchor">
        <button
          class="dh-auto-popup ${!canRecommendAuto ? "is-disabled-value" : ""}"
          type="button"
          aria-label="Авторежим"
          aria-pressed="${autoEnabled ? "true" : "false"}"
          @click=${() => handleAutoButtonClick(card, config, autoEnabled)}
        >
          <ha-icon icon="${autoPopupIcon}"></ha-icon>
          <span class="dh-auto-popup-label">${autoLabelText}</span>
          <span class="dh-auto-popup-value">${displayAutoValue}</span>
        </button>
      </div>
    ` : q``}

    <div class="dh-hum-stack">
      <div class="dh-hum-panel">
        <button class="dh-luxury-btn" type="button" aria-label="Зменшити цільову вологість" @click=${() => quickAdjustTarget(card, config, -1)}>
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>

        <div class="dh-cyber-wrap">
          ${autoShow ? q`
            <button class="dh-cyber-toggle" type="button" aria-label="Показати панель авто" @click=${() => toggleAutoPopup(card, config)}>
              <ha-icon icon="${autoPopupOpen ? "mdi:chevron-down" : "mdi:chevron-up"}"></ha-icon>
            </button>
          ` : q``}

          <button class="dh-cyber-display" type="button" aria-label="Показати панель авто" @click=${() => handleCenterClick(card, config)}>
            <span class="dh-cyber-val">${targetValue}%</span>
            ${showTgtLabel ? q`<span class="dh-cyber-label">${tgtLabelText}</span>` : q``}
          </button>
        </div>

        <button class="dh-luxury-btn" type="button" aria-label="Збільшити цільову вологість" @click=${() => quickAdjustTarget(card, config, 1)}>
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </div>
    </div>
  `;
}

// components/bottom-controls.js
var STATUS_MAP = {
  off: {
    label: "\u0412\u0438\u043C\u043A\u043D\u0435\u043D\u043E",
    color: "rgba(255,77,77,0.85)",
    manualActive: false
  },
  idle: {
    label: "\u041E\u0447\u0456\u043A\u0443\u0432\u0430\u043D\u043D\u044F",
    color: "#ffb84d",
    manualActive: false
  },
  manual: {
    label: "\u0420\u0443\u0447\u043D\u0438\u0439",
    color: "#ffc600",
    manualActive: true
  },
  drying: {
    label: "\u0410\u0432\u0442\u043E",
    color: "var(--state-humidifier-color, #00bfff)",
    manualActive: false
  },
  drying_manual: {
    label: "\u0410\u0432\u0442\u043E/\u0420\u0443\u0447\u043D\u0438\u0439",
    color: "#7ee7ff",
    manualActive: true
  },
  pause: {
    label: "\u041F\u0430\u0443\u0437\u0430",
    color: "#a0a0a0",
    manualActive: false
  },
  unknown: {
    label: "\u041D\u0435\u0432\u0456\u0434\u043E\u043C\u043E",
    color: "rgba(255,255,255,0.45)",
    manualActive: false
  }
};
function getStatusData(card, config) {
  const entityId = config.status_entity;
  const labelEntityId = entityId + "_label";
  const stateObj = getEntityState(card, entityId);
  const labelObj = getEntityState(card, labelEntityId);
  const rawState = String(stateObj?.state ?? "unknown").trim().toLowerCase();
  const mapped = STATUS_MAP[rawState] || STATUS_MAP.unknown;
  const displayLabel = labelObj ? labelObj.state : mapped.label;
  return {
    state: rawState,
    label: displayLabel,
    color: mapped.color,
    manualActive: mapped.manualActive
  };
}
function getControlState(card, config) {
  const status = getStatusData(card, config);
  return {
    mainOn: isMainEntityOn(card, config?.entity),
    fanOn: isEntityOn(card, config?.fan_entity),
    manualActive: status.manualActive,
    status
  };
}
function getManualScriptEntity(config) {
  return config.manual_script_entity;
}
function handlePower(card, config, action, state) {
  switch (action) {
    case "off": {
      if (state.mainOn && config?.entity) {
        callHA(card, "homeassistant", "turn_off", {
          entity_id: config.entity
        });
      }
      if (state.fanOn && config?.fan_entity) {
        callHA(card, "switch", "turn_off", {
          entity_id: config.fan_entity
        });
      }
      break;
    }
    case "on": {
      if (!state.mainOn && config?.entity) {
        callHA(card, "homeassistant", "turn_on", {
          entity_id: config.entity
        });
      }
      break;
    }
    case "manual": {
      const scriptEntity = getManualScriptEntity(config);
      if (!scriptEntity) return;
      const domain = String(scriptEntity).split(".")[0];
      if (domain === "button") {
        callHA(card, "button", "press", { entity_id: scriptEntity });
      } else if (domain === "script") {
        callHA(card, "script", "turn_on", { entity_id: scriptEntity });
      } else {
        callHA(card, "smart_dehumidifier", "manual_toggle", {});
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
  if (!stateObj || stateObj.state !== "on") return null;
  return formatElapsedSince(stateObj.last_changed);
}
function renderBottomControls(card, config = {}) {
  if (config.show_btns === false) return q``;
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
  const btnOffColor = config.btn_off_color ?? "var(--error-color, #ff4d4d)";
  const btnOnColor = config.btn_on_color ?? "var(--state-humidifier-color, #00bfff)";
  const btnManualColor = config.btn_manual_color ?? "var(--warning-color, #FFD700)";
  const badgeWidth = toPositiveNumber(config.badge_width, 92);
  const badgeHeight = toPositiveNumber(config.badge_height, 22);
  const badgeRadius = toFiniteNumber(config.badge_radius, 6);
  const badgeSize = toPositiveNumber(config.badge_size, 9.5);
  const badgeFontWeight = toFiniteNumber(config.badge_font_weight, 900);
  const badgeBgColor = config.badge_bg_color ?? "#06080b";
  const btnsBottom = toFiniteNumber(config.btns_bottom, 14);
  const badgeOffsetY = toFiniteNumber(config.badge_offset_y, 0);
  const btnLabelSize = toPositiveNumber(config.btn_label_size, 8);
  const fanTextSize = toPositiveNumber(config.fan_text_size, 15);
  const btnIconSize = toPositiveNumber(config.btn_icon_size, 18);
  const widthCss = layoutUnit(controlsMaxWidth, layoutBaseWidth);
  const btnHeightCss = layoutUnit(btnHeight, layoutBaseWidth);
  const offLabel = config.btn_off_label ?? "OFF";
  const onLabel = config.btn_on_label ?? "ON";
  const manualLabel = config.btn_manual_label ?? "MANUAL";
  const offIcon = config.btn_off_icon ?? "mdi:power-cycle";
  const onIcon = config.btn_on_icon ?? "mdi:fan";
  const manualIcon = config.btn_manual_icon ?? "mdi:gesture-tap";
  return q`
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
          class="dh-hill-btn ${!mainOn ? "active" : ""}"
          type="button"
          @click=${() => handlePower(card, config, "off", state)}
        >
          <ha-icon
            icon="${offIcon}"
            class="${!mainOn ? "dh-off-lit-icon" : ""}"
          ></ha-icon>
          <span class="dh-hill-label ${!mainOn ? "dh-off-lit" : ""}">
            ${offLabel}
          </span>
        </button>

        <button
          class="dh-hill-btn dh-btn-center ${mainOn ? "active" : ""}"
          type="button"
          @click=${() => handlePower(card, config, "on", state)}
        >
          <div class="dh-center-content">
            ${timerText ? q`
                  <ha-icon icon="${onIcon}" class="dh-icon-spin"></ha-icon>
                  <span class="dh-timer-text">${timerText}</span>
                ` : q`
                  <ha-icon
                    icon="${onIcon}"
                    class="${mainOn ? "dh-main-lit-icon" : ""}"
                  ></ha-icon>
                  <span class="dh-hill-label ${mainOn ? "dh-main-lit" : ""}">
                    ${onLabel}
                  </span>
                `}
          </div>

          ${config.show_badge ?? true ? q`
                <div class="dh-status-badge" style="color:${status.color};">
                  ${status.label}
                </div>
              ` : q``}
        </button>

        <button
          class="dh-hill-btn ${manualActive ? "active" : ""}"
          type="button"
          @click=${() => handlePower(card, config, "manual", state)}
        >
          <ha-icon
            icon="${manualIcon}"
            class="${manualActive ? "dh-manual-lit-icon" : ""}"
          ></ha-icon>
          <span class="dh-hill-label ${manualActive ? "dh-manual-lit" : ""}">
            ${manualLabel}
          </span>
        </button>
      </div>
    </div>
  `;
}

// components/visual-effects.js
var DEFAULT_FAN_ENTITY = null;
function speedToDuration(value) {
  const speed = clamp(value, 1, 100);
  return 100 / speed;
}
function ensureParticles(card, count) {
  if (!Array.isArray(card._efxParticles) || card._efxParticles.length !== count) {
    card._efxParticles = Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      distMod: Math.random(),
      durMod: Math.random(),
      delayMod: Math.random()
    }));
  }
  return card._efxParticles;
}
function renderVisualEffects(card, config = {}) {
  const fanEntity = config.fan_entity || DEFAULT_FAN_ENTITY;
  const fanOn = isEntityOn(card, fanEntity);
  const layoutBaseWidth = toPositiveNumber(
    config.layout_base_width,
    DEFAULT_LAYOUT_BASE_WIDTH
  );
  const color = config.efx_color ?? "#00ffff";
  const offsetY = toFiniteNumber(config.efx_offset_y, 0);
  const showFan = config.efx_fan_show ?? true;
  const fanSize = toPositiveNumber(config.efx_fan_size, 240);
  const fanOpacity = clamp(config.efx_fan_opacity, 0, 100) / 100;
  const fanDur = speedToDuration(config.efx_fan_speed);
  const showComet = config.efx_comet_show ?? true;
  const cometSize = toPositiveNumber(config.efx_comet_size, 320);
  const cometDur = speedToDuration(config.efx_comet_speed);
  const showCore = config.efx_core_show ?? true;
  const coreSize = toPositiveNumber(config.efx_core_size, 160);
  const coreDur = speedToDuration(config.efx_core_speed);
  const showParts = config.efx_part_show ?? true;
  const numParts = Math.round(clamp(config.efx_part_count, 5, 100));
  const partSpread = toPositiveNumber(config.efx_part_spread, 250);
  const partDurBase = speedToDuration(config.efx_part_speed);
  if (!fanOn) {
    return q`
      <div class="efx-layer" style="opacity: 0; transition: opacity 1s ease;"></div>
    `;
  }
  const particles = showParts ? ensureParticles(card, numParts) : [];
  const particleSizeCss = layoutUnit(3, layoutBaseWidth);
  const fanSizeCss = layoutUnit(fanSize, layoutBaseWidth);
  const cometSizeCss = layoutUnit(cometSize, layoutBaseWidth);
  const coreSizeCss = layoutUnit(coreSize, layoutBaseWidth);
  const offsetYCss = layoutUnit(offsetY, layoutBaseWidth);
  const isDragging = !!card._dragging;
  return q`
    <style>
      .efx-layer {
        position: absolute;
        inset: 0;
        z-index: 0;
        overflow: hidden;
        pointer-events: none;
        border-radius: inherit;
        opacity: 1;
        transition: opacity 1s ease;
      }

      .efx-group {
        position: absolute;
        inset: 0;
        transform: translateY(${offsetYCss});
      }

      .is-dragging .efx-bg-fan,
      .is-dragging .efx-comet-tail,
      .is-dragging .efx-core-ring,
      .is-dragging .efx-core-glow,
      .is-dragging .efx-particle {
        animation-play-state: paused !important;
      }

      .is-dragging .efx-particles,
      .is-dragging .efx-core-glow {
        opacity: 0 !important;
        transition: opacity 0.1s ease;
      }

      .efx-bg-fan {
        position: absolute;
        top: 50%;
        left: 50%;
        display: ${showFan ? "block" : "block"};
        color: ${color};
        opacity: ${fanOpacity};
        --mdc-icon-size: ${fanSizeCss};
        animation: efx-bg-spin ${fanDur}s linear infinite;
      }

      .efx-comet-orbit {
        position: absolute;
        top: 50%;
        left: 50%;
        display: ${showComet ? "block" : "none"};
        width: ${cometSizeCss};
        height: ${cometSizeCss};
        transform: translate(-50%, -50%);
        border-radius: 50%;
        -webkit-mask: radial-gradient(transparent 68%, black 70%);
        mask: radial-gradient(transparent 68%, black 70%);
      }

      .efx-comet-tail {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: conic-gradient(
          from 0deg,
          transparent 50%,
          ${color}66 80%,
          ${color} 100%
        );
        animation: efx-rotate ${cometDur}s linear infinite;
      }

      .efx-energy-core {
        position: absolute;
        top: 50%;
        left: 50%;
        display: ${showCore ? "block" : "none"};
        width: ${coreSizeCss};
        height: ${coreSizeCss};
        transform: translate(-50%, -50%);
      }

      .efx-core-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 1px solid transparent;
        border-top-color: ${color}66;
        animation: efx-rotate ${coreDur}s linear infinite;
      }

      .efx-core-glow {
        position: absolute;
        inset: -20px;
        background: radial-gradient(circle, ${color}33 0%, transparent 60%);
        animation: efx-pulse ${coreDur}s ease-in-out infinite alternate;
        transition: opacity 0.4s ease;
      }

      .efx-particles {
        position: absolute;
        inset: 0;
        display: ${showParts ? "block" : "none"};
        transition: opacity 0.4s ease;
      }

      .efx-particle {
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${particleSizeCss};
        height: ${particleSizeCss};
        opacity: 0;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 0 8px 2px ${color};
      }

      @keyframes efx-bg-spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }

      @keyframes efx-rotate {
        100% { transform: rotate(360deg); }
      }

      @keyframes efx-pulse {
        0% { transform: scale(0.9); opacity: 0.5; }
        100% { transform: scale(1.2); opacity: 1; }
      }

      @keyframes efx-particle-fly {
        0% {
          transform: translate(-50%, -50%) scale(0.1);
          opacity: 0;
        }
        20% {
          opacity: 0.9;
        }
        80% {
          opacity: 0.9;
        }
        100% {
          transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(2.5);
          opacity: 0;
        }
      }
    </style>

    <div class="efx-layer ${isDragging ? "is-dragging" : ""}">
      <div class="efx-group">
        <ha-icon icon="mdi:fan" class="efx-bg-fan"></ha-icon>

        <div class="efx-comet-orbit">
          <div class="efx-comet-tail"></div>
        </div>

        <div class="efx-energy-core">
          <div class="efx-core-glow"></div>
          <div class="efx-core-ring"></div>
        </div>

        <div class="efx-particles">
          ${showParts ? particles.map((p2) => {
    const dist = 30 + p2.distMod * partSpread;
    const dx = layoutUnit(Math.cos(p2.angle) * dist, layoutBaseWidth);
    const dy = layoutUnit(Math.sin(p2.angle) * dist, layoutBaseWidth);
    const duration = partDurBase + p2.durMod * 2;
    const delay = -(p2.delayMod * duration);
    return q`<div class="efx-particle" style="--dx: ${dx}; --dy: ${dy}; animation: efx-particle-fly ${duration}s ease-out infinite ${delay}s;"></div>`;
  }) : q``}
        </div>
      </div>
    </div>
  `;
}

// components/settings-panel.js
function renderSettingsPanel(card, config) {
  if (!card._isSettingsOpen) return q``;
  if (card._openSections === void 0) {
    card._openSections = { auto: false, manual: false, lang: false };
  }
  const hass = card._hass;
  if (!hass) return q``;
  const cfg = config || card._config || {};
  const getVal = (id, def) => {
    if (!id || !hass.states[id]) return def;
    const n2 = Number(hass.states[id].state);
    return Number.isFinite(n2) ? n2 : def;
  };
  const resolved = resolveSdEntities(hass, cfg);
  const entities = {
    delta: resolved.delta_entity || "",
    min: resolved.min_rh_entity || "",
    max: resolved.max_rh_entity || "",
    calc: resolved.calc_entity || "",
    runtime: resolved.manual_runtime_entity || "",
    pause: resolved.manual_pause_runtime_entity || ""
  };
  sdLog("debug", "gear entities", entities);
  const vals = {
    delta: getVal(entities.delta, 3),
    min: getVal(entities.min, 65),
    max: getVal(entities.max, 85),
    runtime: getVal(entities.runtime, 20),
    pause: getVal(entities.pause, 20),
    recommended: entities.calc && hass.states[entities.calc] ? hass.states[entities.calc].state : "--"
  };
  const roomId = resolved.room_humidity_entity || cfg.room_humidity_entity || "";
  const statusId = resolved.status_entity || "";
  const statusAttrs = statusId && hass.states[statusId] ? hass.states[statusId].attributes : {};
  const autoAvailable = statusAttrs.auto_available === true || !!roomId && !!hass.states[roomId] || !!entities.delta && !!hass.states[entities.delta];
  const missing = autoAvailable && (!entities.delta || !entities.min || !entities.max);
  const setNumber = async (entityId, value) => {
    if (!entityId || !hass) {
      sdLog("warn", "setNumber: missing entity", entityId);
      return;
    }
    const domain = String(entityId).split(".")[0];
    const svc = domain === "number" ? "number" : "input_number";
    const num2 = Number(value);
    try {
      await hass.callService(svc, "set_value", {
        entity_id: entityId,
        value: num2
      });
      sdLog("info", "set_value ok", entityId, num2);
    } catch (err) {
      sdLog("error", "set_value failed", entityId, err);
    }
  };
  const clampStep = (value, min, max, step) => {
    const s2 = Number(step) || 1;
    let v2 = Math.round(Number(value) / s2) * s2;
    v2 = Math.min(max, Math.max(min, v2));
    const decimals = (String(s2).split(".")[1] || "").length;
    return Number(v2.toFixed(decimals));
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
      localStorage.setItem("sd_card_lang", lang);
    } catch (_e) {
    }
    sdLog("info", "language set", lang);
    card.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: next },
        bubbles: true,
        composed: true
      })
    );
    card.requestUpdate();
  };
  let currentLang = (cfg.language || cfg.lang || "").toLowerCase();
  if (!currentLang || !["uk", "ru", "en"].includes(currentLang)) {
    try {
      currentLang = localStorage.getItem("sd_card_lang") || "";
    } catch (_e) {
      currentLang = "";
    }
  }
  if (!currentLang) {
    currentLang = "uk";
  }
  const toggleSection = (id) => {
    card._openSections[id] = !card._openSections[id];
    card.requestUpdate();
  };
  const close = () => {
    card._isSettingsOpen = false;
    card.requestUpdate();
  };
  const tt2 = (key) => t2(hass, key, { ...cfg, language: currentLang });
  const stepRow = (label, entityId, value, min, max, step, unit) => q`
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
      ${!entityId ? q`<div class="sp-warn">—</div>` : q``}
    </div>
  `;
  const stopScrollBubble = (e2) => e2.stopPropagation();
  return q`
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
      @click=${(e2) => {
    if (e2.target.classList.contains("sp-overlay")) close();
  }}
    >
      <div
        class="sp-modal"
        @click=${(e2) => e2.stopPropagation()}
        @touchmove=${stopScrollBubble}
        @wheel=${stopScrollBubble}
      >
        <div class="sp-header">
          <div class="sp-title">${tt2("settings")}</div>
          <button class="sp-close" type="button" @click=${close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>

        <div class="sp-scroll" @touchmove=${stopScrollBubble}>
          ${missing ? q`<div class="sp-warn">
                ${tt2("entities_missing")}
              </div>` : q``}

          ${autoAvailable ? q`
          <div class="sp-panel">
            <button class="sp-head" type="button" @click=${() => toggleSection("auto")}>
              <span class="sp-head-label">${tt2("auto_humidity")}</span>
              <ha-icon icon="mdi:chevron-${card._openSections.auto ? "up" : "down"}"></ha-icon>
            </button>
            ${card._openSections.auto ? q`
                  <div class="sp-body">
                    <div class="sp-hud">
                      <div>
                        <div class="sp-hud-label">${tt2("recommended")}</div>
                        <div class="sp-hud-sub">${tt2("room_hint")}</div>
                      </div>
                      <div class="sp-hud-val">${vals.recommended}%</div>
                    </div>
                    ${stepRow(tt2("delta"), entities.delta, vals.delta, 0, 20, 0.5, "%")}
                    ${stepRow(tt2("min_rh"), entities.min, vals.min, 20, 90, 1, "%")}
                    ${stepRow(tt2("max_rh"), entities.max, vals.max, 30, 99, 1, "%")}
                  </div>
                ` : q``}
          </div>
            ` : q``}

          <div class="sp-panel">
            <button class="sp-head" type="button" @click=${() => toggleSection("manual")}>
              <span class="sp-head-label">${tt2("timers")}</span>
              <ha-icon
                icon="mdi:chevron-${card._openSections.manual ? "up" : "down"}"
              ></ha-icon>
            </button>
            ${card._openSections.manual ? q`
                  <div class="sp-body">
                    ${stepRow(
    tt2("runtime"),
    entities.runtime,
    vals.runtime,
    1,
    240,
    1,
    ` ${tt2("min")}`
  )}
                    ${stepRow(
    tt2("pause_time"),
    entities.pause,
    vals.pause,
    1,
    240,
    1,
    ` ${tt2("min")}`
  )}
                  </div>
                ` : q``}
          </div>

          <div class="sp-panel">
            <button class="sp-head" type="button" @click=${() => toggleSection("lang")}>
              <span class="sp-head-label">${tt2("language")}</span>
              <ha-icon icon="mdi:chevron-${card._openSections.lang ? "up" : "down"}"></ha-icon>
            </button>
            ${card._openSections.lang ? q`
                  <div class="sp-body">
                    <div class="sp-lang">
                      ${["uk", "ru", "en"].map(
    (code) => q`
                          <button
                            type="button"
                            class="${currentLang === code ? "active" : ""}"
                            @click=${() => setLanguage(code)}
                          >
                            ${code.toUpperCase()}
                          </button>
                        `
  )}
                    </div>
                  </div>
                ` : q``}
          </div>

          <div class="sp-log-hint">logs: window.__SD_LOGS__</div>
        </div>
      </div>
    </div>
  `;
}

// dehumidifier-card.js
var DEFAULT_BORDER_RADIUS = 28;
var DEFAULT_HEIGHT_PERCENT = 100;
var TICK_MS = 1e3;
var NOISE_DATA_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;
function normalizeAlign(value) {
  return value === "left" || value === "right" ? value : "center";
}
function extractTrackedEntities(config = {}) {
  const ids = /* @__PURE__ */ new Set();
  for (const [key, value] of Object.entries(config)) {
    if (!value) continue;
    if (key === "entity" || key.endsWith("_entity")) {
      if (typeof value === "string" && value.trim()) ids.add(value);
      continue;
    }
    if (key.endsWith("_entities") && Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string" && item.trim()) ids.add(item);
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
var MyDehumidifierCard = class extends ft {
  static getConfigElement() {
    return document.createElement("smart-dehumidifier-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:smart-dehumidifier"
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
    if (config.arc_radius === void 0) config = { ...config, arc_radius: 150 };
    if (!config.language && !config.lang) {
      let lang = "uk";
      try {
        const stored = localStorage.getItem("sd_card_lang");
        if (stored) lang = stored;
      } catch (_e) {
      }
      config = { ...config, language: lang };
    }
    if (!config || typeof config !== "object") {
      throw new Error("\u041D\u0435\u0432\u0430\u043B\u0456\u0434\u043D\u0430 \u043A\u043E\u043D\u0444\u0456\u0433\u0443\u0440\u0430\u0446\u0456\u044F \u043A\u0430\u0440\u0442\u043A\u0438");
    }
    let merged = {
      type: "custom:smart-dehumidifier",
      ...config
    };
    if (this._hass) {
      merged = { ...merged, ...resolveSdEntities(this._hass, merged) };
    }
    this._config = merged;
    this._trackedEntityIds = extractTrackedEntities(this._config);
    this._syncTicker();
  }
  static getConfigForm() {
    return {
      schema: []
    };
  }
  _isFanRunning(hass = this._hass) {
    const fanEntity = this._config?.fan_entity;
    if (!fanEntity || !hass?.states) return false;
    return hass.states[fanEntity]?.state === "on";
  }
  set hass(hass) {
    const oldHass = this._hass;
    if (hass && this._config) {
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
    this.requestUpdate("_hass", oldHass);
  }
  get hass() {
    return this._hass;
  }
  updated(changedProps) {
    if (changedProps.has("_config")) {
      this._trackedEntityIds = extractTrackedEntities(this._config || {});
      this._syncTicker();
    }
  }
  shouldUpdate(changedProps) {
    if (changedProps.has("_config") || changedProps.has("_targetHumidity") || changedProps.has("_isSettingsOpen") || changedProps.has("_humPanelAutoPopupOpen")) {
      return true;
    }
    if (changedProps.has("_hass")) {
      const prevHass = changedProps.get("_hass");
      return hasTrackedEntityChange(prevHass, this._hass, this._trackedEntityIds);
    }
    return true;
  }
  _shouldRunTicker() {
    return this.isConnected && this._isFanRunning();
  }
  // --- ВОТ ЭТА ФУНКЦИЯ БЫЛА ПРОПУЩЕНА ---
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
    const timerEl = this.shadowRoot.querySelector(".dh-timer-text");
    if (!timerEl) return;
    const fanEntity = this._config?.fan_entity;
    if (!fanEntity || !this._hass?.states?.[fanEntity]) return;
    const stateObj = this._hass.states[fanEntity];
    if (stateObj.state !== "on") return;
    const newText = formatElapsedSince(stateObj.last_changed);
    if (!newText) return;
    for (const node of timerEl.childNodes) {
      if (node.nodeType === 3) {
        if (node.nodeValue !== newText) {
          node.nodeValue = newText;
        }
        return;
      }
    }
  }
  _getLayoutData() {
    const config = this._config || {};
    const borderRadius = Math.max(0, toFiniteNumber(config.card_border_radius, DEFAULT_BORDER_RADIUS));
    const glassMaxWidth = toPositiveNumber(config.glass_max_width, 1e3);
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
    let justifyContent = "center";
    if (align === "left") justifyContent = "flex-start";
    if (align === "right") justifyContent = "flex-end";
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
      frameMl: align === "right" ? "auto" : "0",
      frameMr: align === "left" ? "auto" : align === "center" ? "auto" : "0",
      padTop: `${toFiniteNumber(config.content_padding_top, 40)}px`,
      padBottom: `${toFiniteNumber(config.content_padding_bottom, 16)}px`,
      padLeft: `${toFiniteNumber(config.content_padding_left, 14)}px`,
      padRight: `${toFiniteNumber(config.content_padding_right, 14)}px`,
      offsetX: `${toFiniteNumber(config.device_offset_x, 0)}px`,
      offsetY: `${toFiniteNumber(config.device_offset_y, 0)}px`
    };
  }
  _renderSceneContent() {
    const config = this._config;
    const renderConfig = { ...config, layout_base_width: 400 };
    return q`
      ${renderVisualEffects(this, renderConfig)}

      <div class="dh-limit-layer dh-limit-arc">
        ${config.show_arc ?? true ? renderArcSlider(this, renderConfig) : null}
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
    if (!this._config || !this._hass) return q``;
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
    return q`
      <ha-card class="${this._isSettingsOpen ? "dh-settings-open" : ""}" style="${cardStyle}">
        <div class="dh-card-bg" aria-hidden="true">
          <div class="dh-card-bg__base"></div>
          <div class="dh-card-bg__vignette"></div>
          <div class="dh-card-bg__glass-curve"></div>
          <div class="dh-card-bg__specular"></div>
          <div class="dh-card-bg__noise"></div>
          <div class="dh-card-bg__top-line"></div>
          <div class="dh-card-bg__edge"></div>
        </div>

        <button class="dh-cog-btn" @click=${() => {
      this._isSettingsOpen = true;
      this.requestUpdate();
    }}>
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
};
__publicField(MyDehumidifierCard, "properties", {
  _config: { state: true },
  _hass: { state: true },
  // _tick ВИДАЛЕНО: таймер більше не провокує щосекундний повний рендер
  _targetHumidity: { state: true },
  _isSettingsOpen: { state: true },
  _humPanelAutoPopupOpen: { state: true }
});
__publicField(MyDehumidifierCard, "styles", r`
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
      background-image: ${o(NOISE_DATA_URI)};
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
  `);
if (!customElements.get("smart-dehumidifier")) {
  customElements.define("smart-dehumidifier", MyDehumidifierCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c2) => c2.type === "smart-dehumidifier")) {
  window.customCards.push({
    type: "smart-dehumidifier",
    name: "Smart Dehumidifier",
    description: "\u041F\u0440\u0435\u043C\u0456\u0443\u043C \u043A\u0430\u0440\u0442\u043A\u0430 \u043E\u0441\u0443\u0448\u0443\u0432\u0430\u0447\u0430 \u0437 \u0432\u0456\u0437\u0443\u0430\u043B\u044C\u043D\u0438\u043C \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440\u043E\u043C",
    preview: true,
    documentationURL: "https://github.com/kdinya/Smart-Dehumidifier"
  });
}

// visual-editor-config.js
var field = (type, key, label, extra = {}) => ({ key, label, type, ...extra });
var txt = (key, label, def = "") => field("txt", key, label, { default: def });
var num = (key, label, min, max, def, step = 1) => field("num", key, label, { min, max, step, default: def });
var tog = (key, label, def = false) => field("tog", key, label, { default: def });
var sel = (key, label, def, options) => field("select", key, label, { default: def, options });
var section = (id, em, title, fields) => ({ id, em, title, fields });
var ALIGNMENT_OPTIONS = [
  { value: "left", label: "\u041B\u0456\u0432\u043E\u0440\u0443\u0447" },
  { value: "center", label: "\u041F\u043E \u0446\u0435\u043D\u0442\u0440\u0443" },
  { value: "right", label: "\u041F\u0440\u0430\u0432\u043E\u0440\u0443\u0447" }
];
var EDITOR_SCHEMA = [
  section("auto_humidity", "\u{1F321}\uFE0F", "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u0430 \u0432\u043E\u043B\u043E\u0433\u0456\u0441\u0442\u044C (\u0434\u0438\u0437\u0430\u0439\u043D)", [
    tog("auto_ui_show", "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 \u043F\u0430\u043D\u0435\u043B\u044C Auto", true),
    num("auto_ui_popup_x", "\u0417\u043C\u0456\u0449\u0435\u043D\u043D\u044F \u043F\u0430\u043D\u0435\u043B\u0456 \u043F\u043E X", -200, 200, 0, 1),
    num("auto_ui_popup_y", "\u0417\u043C\u0456\u0449\u0435\u043D\u043D\u044F \u043F\u0430\u043D\u0435\u043B\u0456 \u043F\u043E Y", -100, 300, 92, 1),
    num("auto_ui_popup_width", "\u0428\u0438\u0440\u0438\u043D\u0430 \u043F\u0430\u043D\u0435\u043B\u0456", 80, 400, 164, 1),
    num("auto_ui_popup_height", "\u0412\u0438\u0441\u043E\u0442\u0430 \u043F\u0430\u043D\u0435\u043B\u0456", 24, 120, 40, 1),
    num("auto_ui_popup_radius", "\u0417\u0430\u043E\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u043D\u044F", 0, 40, 20, 1),
    num("auto_ui_padding_x", "\u0412\u043D\u0443\u0442\u0440\u0456\u0448\u043D\u0456\u0439 \u0432\u0456\u0434\u0441\u0442\u0443\u043F X", 0, 40, 14, 1),
    num("auto_ui_gap", "\u0412\u0456\u0434\u0441\u0442\u0443\u043F \u043C\u0456\u0436 \u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u043C\u0438", 0, 30, 8, 1),
    num("auto_ui_icon_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u0456\u043A\u043E\u043D\u043A\u0438", 8, 48, 18, 1),
    num("auto_ui_label_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u043F\u0456\u0434\u043F\u0438\u0441\u0443", 8, 32, 13, 1),
    num("auto_ui_value_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F %", 8, 40, 15, 1),
    txt("auto_ui_color", "\u041A\u043E\u043B\u0456\u0440 \u0430\u043A\u0446\u0435\u043D\u0442\u0443", "#7fc8ff"),
    txt("auto_ui_icon", "\u0406\u043A\u043E\u043D\u043A\u0430 (mdi:...)", "mdi:water-percent"),
    txt("auto_ui_label_text", "\u0422\u0435\u043A\u0441\u0442 \u043F\u0456\u0434\u043F\u0438\u0441\u0443 (\u043F\u0443\u0441\u0442\u043E = Auto)", ""),
    num("auto_ui_arrow_x", "\u0421\u0442\u0440\u0456\u043B\u043A\u0430: \u0437\u043C\u0456\u0449\u0435\u043D\u043D\u044F X", -100, 100, 0, 1),
    num("auto_ui_arrow_y", "\u0421\u0442\u0440\u0456\u043B\u043A\u0430: \u0437\u043C\u0456\u0449\u0435\u043D\u043D\u044F Y", -100, 100, 0, 1),
    num("auto_ui_arrow_width", "\u0421\u0442\u0440\u0456\u043B\u043A\u0430: \u0448\u0438\u0440\u0438\u043D\u0430", 8, 60, 20, 1),
    num("auto_ui_arrow_height", "\u0421\u0442\u0440\u0456\u043B\u043A\u0430: \u0432\u0438\u0441\u043E\u0442\u0430", 6, 40, 12, 1),
    num("auto_ui_arrow_icon_size", "\u0421\u0442\u0440\u0456\u043B\u043A\u0430: \u0440\u043E\u0437\u043C\u0456\u0440 \u0456\u043A\u043E\u043D\u043A\u0438", 6, 32, 13, 1),
    num("auto_ui_arrow_radius", "\u0421\u0442\u0440\u0456\u043B\u043A\u0430: \u0437\u0430\u043E\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u043D\u044F", 0, 30, 10, 1)
  ]),
  section("layout", "\u{1F4D0}", "\u0420\u043E\u0437\u043A\u043B\u0430\u0434\u043A\u0430", [
    num("card_border_radius", "\u0417\u0430\u043E\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u043D\u044F \u043A\u0430\u0440\u0442\u043A\u0438", 0, 80, 28, 1),
    num("card_height_percent", "\u0412\u0438\u0441\u043E\u0442\u0430 \u043A\u0430\u0440\u0442\u043A\u0438 \u043D\u0430 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0456 (%)", 30, 200, 100, 1),
    num("glass_max_width", "\u041C\u0430\u043A\u0441. \u0448\u0438\u0440\u0438\u043D\u0430 \u0421\u041A\u041B\u0410 (\u0434\u043B\u044F \u041F\u041A)", 200, 2e3, 1e3, 10),
    num("glass_aspect_ratio", "\u041F\u0440\u043E\u043F\u043E\u0440\u0446\u0456\u044F \u0441\u043A\u043B\u0430 \u043D\u0430 \u041F\u041A (\u0428\u0438\u0440/\u0412\u0438\u0441)", 1, 3, 1.8, 0.1),
    num("layout_base_width", "\u041C\u0430\u043A\u0441. \u0448\u0438\u0440\u0438\u043D\u0430 \u041F\u0420\u0418\u041B\u0410\u0414\u0423", 200, 1e3, 400, 10),
    sel("alignment", "\u0412\u0438\u0440\u0456\u0432\u043D\u044E\u0432\u0430\u043D\u043D\u044F \u043E\u0441\u0443\u0448\u0443\u0432\u0430\u0447\u0430", "center", ALIGNMENT_OPTIONS),
    num("content_padding_top", "\u0412\u0456\u0434\u0441\u0442\u0443\u043F \u0437\u0432\u0435\u0440\u0445\u0443", 0, 200, 40, 1),
    num("content_padding_bottom", "\u0412\u0456\u0434\u0441\u0442\u0443\u043F \u0437\u043D\u0438\u0437\u0443", 0, 200, 16, 1),
    num("content_padding_left", "\u0412\u0456\u0434\u0441\u0442\u0443\u043F \u043B\u0456\u0432\u043E\u0440\u0443\u0447", 0, 400, 14, 1),
    num("content_padding_right", "\u0412\u0456\u0434\u0441\u0442\u0443\u043F \u043F\u0440\u0430\u0432\u043E\u0440\u0443\u0447", 0, 400, 14, 1),
    num("device_offset_x", "\u0417\u0441\u0443\u0432 \u043F\u0440\u0438\u043B\u0430\u0434\u0443 \u043F\u043E X", -200, 200, 0, 1),
    num("device_offset_y", "\u0417\u0441\u0443\u0432 \u043F\u0440\u0438\u043B\u0430\u0434\u0443 \u043F\u043E Y", -200, 200, 0, 1),
    num("controls_max_width", "\u041C\u0430\u043A\u0441. \u0448\u0438\u0440\u0438\u043D\u0430 \u043D\u0438\u0436\u043D\u0456\u0445 \u0431\u043B\u043E\u043A\u0456\u0432", 80, 900, 520, 1)
  ]),
  section("arc", "\u{1F535}", "\u0414\u0443\u0433\u0430 \u0442\u0430 \u043F\u043E\u0432\u0437\u0443\u043D\u043E\u043A", [
    tog("show_arc", "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 \u0434\u0443\u0433\u0443", true),
    num("arc_start", "\u041F\u043E\u0447\u0430\u0442\u043E\u043A \u0434\u0443\u0433\u0438", 0, 360, 225, 1),
    num("arc_span", "\u0414\u043E\u0432\u0436\u0438\u043D\u0430 \u0434\u0443\u0433\u0438", 30, 360, 270, 1),
    num("arc_radius", "\u0420\u0430\u0434\u0456\u0443\u0441 \u0434\u0443\u0433\u0438", 50, 500, 150, 1),
    num("arc_bg_width", "\u0422\u043E\u0432\u0449\u0438\u043D\u0430 \u0444\u043E\u043D\u0443", 1, 120, 30, 1),
    num("arc_cur_width", "\u0422\u043E\u0432\u0449\u0438\u043D\u0430 \u043F\u043E\u0442\u043E\u0447\u043D\u043E\u0457", 1, 120, 30, 1),
    num("arc_tgt_width", "\u0422\u043E\u0432\u0449\u0438\u043D\u0430 \u0446\u0456\u043B\u0456", 1, 120, 30, 1),
    tog("arc_glow", "\u0421\u0432\u0456\u0442\u0456\u043D\u043D\u044F \u0434\u0443\u0433\u0438", true),
    num("dot_radius", "\u0420\u0430\u0434\u0456\u0443\u0441 \u043F\u043E\u0432\u0437\u0443\u043D\u043A\u0430", 3, 80, 24, 1),
    num("dot_hit_radius", "\u0417\u043E\u043D\u0430 \u0434\u043E\u0442\u0438\u043A\u0443 \u043F\u043E\u0432\u0437\u0443\u043D\u043A\u0430", 6, 120, 34, 1),
    tog("dot_glow", "\u0421\u0432\u0456\u0442\u0456\u043D\u043D\u044F \u043F\u043E\u0432\u0437\u0443\u043D\u043A\u0430", true)
  ]),
  section("humidity", "\u{1F4A7}", "\u041F\u043E\u0442\u043E\u0447\u043D\u0430 \u0432\u043E\u043B\u043E\u0433\u0456\u0441\u0442\u044C", [
    tog("show_current", "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 \u0432\u043E\u043B\u043E\u0433\u0456\u0441\u0442\u044C", true),
    num("cur_max_width", "\u041C\u0430\u043A\u0441. \u0448\u0438\u0440\u0438\u043D\u0430 \u0442\u0435\u043A\u0441\u0442\u0443", 100, 600, 400, 10),
    txt("cur_font_family", "\u0428\u0440\u0438\u0444\u0442", "inherit"),
    num("cur_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u0446\u0456\u043B\u043E\u0457", 10, 220, 90, 1),
    num("cur_dec_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u0434\u0435\u0441\u044F\u0442\u043A\u043E\u0432\u043E\u0457", 10, 160, 60, 1),
    num("cur_unit_size", "\u0420\u043E\u0437\u043C\u0456\u0440 %", 8, 160, 50, 1),
    num("cur_font_weight", "\u0416\u0438\u0440\u043D\u0456\u0441\u0442\u044C \u0446\u0438\u0444\u0440", 100, 900, 500, 100),
    num("cur_unit_weight", "\u0416\u0438\u0440\u043D\u0456\u0441\u0442\u044C %", 100, 900, 300, 100),
    tog("cur_show_decimal", "\u041F\u043E\u043A\u0430\u0437\u0443\u0432\u0430\u0442\u0438 \u0434\u0435\u0441\u044F\u0442\u043A\u043E\u0432\u0443", true),
    tog("cur_show_unit", "\u041F\u043E\u043A\u0430\u0437\u0443\u0432\u0430\u0442\u0438 %", true),
    num("cur_letter_spacing", "\u0406\u043D\u0442\u0435\u0440\u0432\u0430\u043B \u0446\u0438\u0444\u0440", -20, 20, -2, 0.5),
    num("cur_gap", "\u0412\u0456\u0434\u0441\u0442\u0430\u043D\u044C \u043C\u0456\u0436 \u0447\u0438\u0441\u043B\u0430\u043C\u0438", 0, 20, 3, 0.5),
    num("cur_unit_margin_left", "\u0412\u0456\u0434\u0441\u0442\u0443\u043F %", -20, 40, 2, 0.5),
    num("cur_offset_y", "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u043D\u044F \u043F\u043E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u0456 Y", -200, 200, 10, 1)
  ]),
  section("target", "\u{1F3AF}", "\u041F\u0430\u043D\u0435\u043B\u044C \u0446\u0456\u043B\u044C\u043E\u0432\u043E\u0457 \u0432\u043E\u043B\u043E\u0433\u043E\u0441\u0442\u0456", [
    tog("show_hum_panel", "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 \u043F\u0430\u043D\u0435\u043B\u044C", true),
    num("hum_panel_width", "\u0428\u0438\u0440\u0438\u043D\u0430 \u043F\u0430\u043D\u0435\u043B\u0456 (%)", 120, 520, 240, 1),
    num("hum_panel_max_width", "\u041C\u0430\u043A\u0441. \u0448\u0438\u0440\u0438\u043D\u0430 \u043F\u0430\u043D\u0435\u043B\u0456 (px)", 120, 600, 320, 10),
    num("hum_panel_height", "\u0412\u0438\u0441\u043E\u0442\u0430 \u043F\u0430\u043D\u0435\u043B\u0456", 40, 220, 54, 1),
    num("hum_panel_radius", "\u0417\u0430\u043E\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u043D\u044F \u043F\u0430\u043D\u0435\u043B\u0456", 0, 100, 28, 1),
    num("hum_panel_padding_x", "\u0412\u043D\u0443\u0442\u0440\u0456\u0448\u043D\u0456\u0439 \u0432\u0456\u0434\u0441\u0442\u0443\u043F X", 0, 40, 5, 1),
    num("hum_display_width", "\u0428\u0438\u0440\u0438\u043D\u0430 \u0434\u0438\u0441\u043F\u043B\u0435\u044F", 40, 260, 90, 1),
    num("hum_display_height", "\u0412\u0438\u0441\u043E\u0442\u0430 \u0434\u0438\u0441\u043F\u043B\u0435\u044F", 20, 160, 42, 1),
    num("hum_display_radius", "\u0417\u0430\u043E\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u043D\u044F \u0434\u0438\u0441\u043F\u043B\u0435\u044F", 0, 80, 12, 1),
    num("hum_btn_size", "\u0414\u0456\u0430\u043C\u0435\u0442\u0440 \u043A\u043D\u043E\u043F\u043E\u043A \xB1", 20, 160, 40, 1),
    num("hum_btn_icon_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u0456\u043A\u043E\u043D\u043E\u043A \xB1", 8, 64, 20, 1),
    num("hum_panel_bottom", "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u043D\u044F \u043F\u043E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u0456 Y", -100, 500, 110, 1)
  ]),
  section("buttons", "\u{1F518}", "\u041D\u0438\u0436\u043D\u0456 \u043A\u043D\u043E\u043F\u043A\u0438", [
    tog("show_btns", "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 \u043A\u043D\u043E\u043F\u043A\u0438", true),
    num("btn_height", "\u0412\u0438\u0441\u043E\u0442\u0430 \u043A\u043D\u043E\u043F\u043E\u043A", 20, 120, 54, 1),
    num("btn_icon_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u0456\u043A\u043E\u043D\u043E\u043A", 8, 60, 18, 1),
    num("btn_label_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u043F\u0456\u0434\u043F\u0438\u0441\u0456\u0432", 6, 30, 8, 1),
    num("fan_text_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u0442\u0430\u0439\u043C\u0435\u0440\u0430 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430", 6, 40, 15, 1),
    tog("show_badge", "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0438 \u0431\u0435\u0439\u0434\u0436 \u0441\u0442\u0430\u0442\u0443\u0441\u0443", true),
    num("badge_width", "\u0428\u0438\u0440\u0438\u043D\u0430 \u0431\u0435\u0439\u0434\u0436\u0430 (%)", 40, 100, 92, 1),
    num("badge_height", "\u0412\u0438\u0441\u043E\u0442\u0430 \u0431\u0435\u0439\u0434\u0436\u0430", 10, 50, 22, 1),
    num("badge_radius", "\u0417\u0430\u043E\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u043D\u044F \u0431\u0435\u0439\u0434\u0436\u0430", 0, 30, 6, 1),
    num("badge_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u0442\u0435\u043A\u0441\u0442\u0443 \u0431\u0435\u0439\u0434\u0436\u0430", 4, 30, 9.5, 0.5),
    num("badge_font_weight", "\u0416\u0438\u0440\u043D\u0456\u0441\u0442\u044C \u0442\u0435\u043A\u0441\u0442\u0443 \u0431\u0435\u0439\u0434\u0436\u0430", 100, 900, 900, 100),
    txt("btn_off_label", "\u041F\u0456\u0434\u043F\u0438\u0441 OFF", "OFF"),
    txt("btn_on_label", "\u041F\u0456\u0434\u043F\u0438\u0441 ON", "ON"),
    txt("btn_manual_label", "\u041F\u0456\u0434\u043F\u0438\u0441 MANUAL", "MANUAL"),
    txt("btn_off_icon", "\u0406\u043A\u043E\u043D\u043A\u0430 OFF", "mdi:power-cycle"),
    txt("btn_on_icon", "\u0406\u043A\u043E\u043D\u043A\u0430 ON", "mdi:fan"),
    txt("btn_manual_icon", "\u0406\u043A\u043E\u043D\u043A\u0430 MANUAL", "mdi:gesture-tap"),
    num("btns_bottom", "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u043D\u044F \u0431\u043B\u043E\u043A\u0443 \u043F\u043E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u0456 Y", -100, 300, 14, 1),
    num("badge_offset_y", "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u043D\u044F \u0431\u0435\u0439\u0434\u0436\u0430 \u043F\u043E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u0456 Y", -100, 100, 0, 1)
  ]),
  section("effects", "\u2728", "\u0412\u0456\u0437\u0443\u0430\u043B\u044C\u043D\u0456 \u0435\u0444\u0435\u043A\u0442\u0438", [
    tog("efx_fan_show", "\u0423\u0432\u0456\u043C\u043A\u043D\u0443\u0442\u0438 \u0444\u043E\u043D\u043E\u0432\u0438\u0439 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440", true),
    num("efx_fan_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430", 50, 600, 240, 10),
    num("efx_fan_opacity", "\u041F\u0440\u043E\u0437\u043E\u0440\u0456\u0441\u0442\u044C \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430 (%)", 0, 100, 10, 1),
    num("efx_fan_speed", "\u0428\u0432\u0438\u0434\u043A\u0456\u0441\u0442\u044C \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430 (1-100)", 1, 100, 25, 1),
    tog("efx_comet_show", "\u0423\u0432\u0456\u043C\u043A\u043D\u0443\u0442\u0438 \u043A\u043E\u043C\u0435\u0442\u0443 (\u043E\u0440\u0431\u0456\u0442\u0443)", true),
    num("efx_comet_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u043E\u0440\u0431\u0456\u0442\u0438", 50, 600, 320, 10),
    num("efx_comet_speed", "\u0428\u0432\u0438\u0434\u043A\u0456\u0441\u0442\u044C \u043A\u043E\u043C\u0435\u0442\u0438 (1-100)", 1, 100, 66, 1),
    tog("efx_core_show", "\u0423\u0432\u0456\u043C\u043A\u043D\u0443\u0442\u0438 \u043F\u0443\u043B\u044C\u0441\u0443\u044E\u0447\u0435 \u044F\u0434\u0440\u043E", true),
    num("efx_core_size", "\u0420\u043E\u0437\u043C\u0456\u0440 \u044F\u0434\u0440\u0430", 50, 500, 160, 10),
    num("efx_core_speed", "\u0428\u0432\u0438\u0434\u043A\u0456\u0441\u0442\u044C \u043F\u0443\u043B\u044C\u0441\u0430\u0446\u0456\u0457 (1-100)", 1, 100, 50, 1),
    tog("efx_part_show", "\u0423\u0432\u0456\u043C\u043A\u043D\u0443\u0442\u0438 \u0447\u0430\u0441\u0442\u0438\u043D\u043A\u0438", true),
    num("efx_part_count", "\u041A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u0447\u0430\u0441\u0442\u0438\u043D\u043E\u043A", 5, 100, 25, 1),
    num("efx_part_spread", "\u0420\u0430\u0434\u0456\u0443\u0441 \u0440\u043E\u0437\u043B\u0456\u0442\u0430\u043D\u043D\u044F \u0447\u0430\u0441\u0442\u0438\u043D\u043E\u043A", 50, 600, 250, 10),
    num("efx_part_speed", "\u0428\u0432\u0438\u0434\u043A\u0456\u0441\u0442\u044C \u0447\u0430\u0441\u0442\u0438\u043D\u043E\u043A (1-100)", 1, 100, 66, 1),
    num("efx_offset_y", "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u043D\u044F \u043F\u043E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u0456 Y", -200, 200, 0, 1)
  ])
];

// dehumidifier-editor.js
var STORAGE_KEY = "dh-editor-open-sections-v8";
var SECTION_I18N = {
  entities: "ed_entities",
  auto_humidity: "ed_auto_humidity",
  layout: "ed_layout",
  arc: "ed_arc",
  humidity: "ed_humidity",
  target: "ed_target",
  buttons: "ed_buttons",
  effects: "ed_effects"
};
var EDITOR_VERSION = "1.6.0";
function fireEvent(node, type, detail = {}, options = {}) {
  const event = new CustomEvent(type, {
    detail,
    bubbles: options.bubbles ?? true,
    composed: options.composed ?? true
  });
  node.dispatchEvent(event);
  return event;
}
function clamp2(value, min, max) {
  const num2 = Number(value);
  if (Number.isNaN(num2)) return min;
  return Math.min(Math.max(num2, min), max);
}
function roundToStep(value, step = 1) {
  const s2 = Number(step) || 1;
  const rounded = Math.round(Number(value) / s2) * s2;
  const decimals = (String(s2).split(".")[1] || "").length;
  return Number(rounded.toFixed(decimals));
}
function formatValue(value, step = 1) {
  const decimals = (String(step).split(".")[1] || "").length;
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
}
function writeStoredSections(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (_e) {
  }
}
function buildInitialSections(current = {}) {
  const result = {};
  for (const section2 of EDITOR_SCHEMA) {
    result[section2.id] = false;
  }
  if (current && typeof current === "object") {
    for (const [id, open] of Object.entries(current)) {
      if (id in result) result[id] = !!open;
    }
  }
  return result;
}
var DehumidifierEditor = class extends ft {
  constructor() {
    super();
    this._config = {};
    this._openSections = buildInitialSections();
    this._drafts = {};
  }
  setConfig(config) {
    this._config = { ...config || {} };
    this._openSections = buildInitialSections(this._openSections);
  }
  _fieldValue(field2) {
    const value = this._config?.[field2.key];
    return value !== void 0 ? value : field2.default;
  }
  _draftValue(field2) {
    return Object.prototype.hasOwnProperty.call(this._drafts, field2.key) ? this._drafts[field2.key] : String(this._fieldValue(field2) ?? "");
  }
  _emitConfig(next) {
    this._config = next;
    fireEvent(this, "config-changed", { config: next });
  }
  _setValue(field2, rawValue) {
    const next = { ...this._config };
    if (field2.type === "tog") {
      next[field2.key] = !!rawValue;
    } else if (field2.type === "num") {
      next[field2.key] = clamp2(
        roundToStep(rawValue, field2.step ?? 1),
        field2.min ?? -Infinity,
        field2.max ?? Infinity
      );
    } else {
      const str = String(rawValue ?? "").trim();
      if (str) next[field2.key] = str;
      else delete next[field2.key];
    }
    this._emitConfig(next);
  }
  _changeByStep(field2, direction) {
    const current = Number(this._fieldValue(field2) ?? 0);
    const step = Number(field2.step ?? 1);
    this._setValue(field2, current + direction * step);
  }
  _tt(key) {
    try {
      return t2(this.hass, key, this._config || {});
    } catch (_e) {
      return key;
    }
  }
  _sectionTitle(section2) {
    try {
      const key = SECTION_I18N[section2?.id];
      if (key) return this._tt(key);
    } catch (_e) {
    }
    return section2?.title || section2?.id || "";
  }
  _toggleSection(id) {
    this._openSections = {
      ...this._openSections,
      [id]: !this._openSections[id]
    };
    writeStoredSections(this._openSections);
    this.requestUpdate();
  }
  _resetField(field2) {
    const next = { ...this._config };
    delete next[field2.key];
    const nextDrafts = { ...this._drafts };
    delete nextDrafts[field2.key];
    this._drafts = nextDrafts;
    this._emitConfig(next);
  }
  _onTextInput(field2, e2) {
    this._drafts = { ...this._drafts, [field2.key]: e2.target.value };
  }
  _commitTextDraft(field2) {
    if (!Object.prototype.hasOwnProperty.call(this._drafts, field2.key)) return;
    const value = this._drafts[field2.key];
    const nextDrafts = { ...this._drafts };
    delete nextDrafts[field2.key];
    this._drafts = nextDrafts;
    this._setValue(field2, value);
  }
  _renderReset(field2) {
    if (!Object.prototype.hasOwnProperty.call(this._config || {}, field2.key)) {
      return q``;
    }
    return q`
      <button class="field-reset" type="button" @click=${() => this._resetField(field2)} title="Reset">
        ↺
      </button>
    `;
  }
  _renderToggle(field2) {
    const value = Boolean(this._fieldValue(field2));
    return q`
      <div class="field">
        <div class="toggle-row">
          <div class="field-label">${field2.label}</div>
          <label class="switch">
            <input type="checkbox" .checked=${value} @change=${(e2) => this._setValue(field2, e2.target.checked)} />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `;
  }
  _renderSelect(field2) {
    const value = String(this._fieldValue(field2) ?? "");
    return q`
      <div class="field">
        <div class="field-head">
          <div class="field-label">${field2.label}</div>
          ${this._renderReset(field2)}
        </div>
        <select class="select-input" .value=${value} @change=${(e2) => this._setValue(field2, e2.target.value)}>
          ${(field2.options || []).map((o2) => {
      const labelKey = o2.value === "left" ? "align_left" : o2.value === "right" ? "align_right" : o2.value === "center" ? "align_center" : null;
      const label = labelKey ? this._tt(labelKey) : o2.label;
      return q`<option value=${o2.value}>${label}</option>`;
    })}
        </select>
      </div>
    `;
  }
  _renderText(field2) {
    const value = this._draftValue(field2);
    return q`
      <div class="field">
        <div class="field-head">
          <div class="field-label">${field2.label}</div>
          ${this._renderReset(field2)}
        </div>
        <input
          class="text-input"
          type="text"
          .value=${value}
          @input=${(e2) => this._onTextInput(field2, e2)}
          @change=${() => this._commitTextDraft(field2)}
          @blur=${() => this._commitTextDraft(field2)}
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
    return clamp2(stepped, min, max);
  }
  _onRangePointerDown(e2) {
    const input = e2.currentTarget;
    input._sdGesture = {
      startX: e2.clientX,
      startY: e2.clientY,
      axis: null,
      moved: false
    };
    try {
      input.setPointerCapture(e2.pointerId);
    } catch (_err) {
    }
    e2.preventDefault();
  }
  _onRangePointerMove(field2, min, max, step) {
    return (e2) => {
      const input = e2.currentTarget;
      const g2 = input._sdGesture;
      if (!g2) return;
      const dx = Math.abs(e2.clientX - g2.startX);
      const dy = Math.abs(e2.clientY - g2.startY);
      if (!g2.axis) {
        if (dx < 8 && dy < 8) return;
        g2.axis = dx >= dy ? "x" : "y";
      }
      if (g2.axis === "y") return;
      g2.moved = true;
      const v2 = this._rangeValueFromPointer(input, e2.clientX, min, max, step);
      input.value = String(v2);
      this._setValue(field2, v2);
      e2.preventDefault();
    };
  }
  _onRangePointerUp(e2) {
    e2.currentTarget._sdGesture = null;
    try {
      e2.currentTarget.releasePointerCapture(e2.pointerId);
    } catch (_err) {
    }
  }
  _renderNumber(field2) {
    const min = field2.min ?? 0;
    const max = field2.max ?? 100;
    const step = field2.step ?? 1;
    const value = Number(this._fieldValue(field2) ?? min);
    return q`
      <div class="field">
        <div class="field-head">
          <div class="field-label">${field2.label}</div>
          ${this._renderReset(field2)}
        </div>
        <div class="num-row">
          <button class="num-btn" type="button" @click=${() => this._changeByStep(field2, -1)}>−</button>
          <input
            class="range"
            type="range"
            min=${min}
            max=${max}
            step=${step}
            .value=${String(value)}
            style="touch-action: none;"
            @pointerdown=${(e2) => this._onRangePointerDown(e2)}
            @pointermove=${this._onRangePointerMove(field2, min, max, step)}
            @pointerup=${(e2) => this._onRangePointerUp(e2)}
            @pointercancel=${(e2) => this._onRangePointerUp(e2)}
          />
          <button class="num-btn" type="button" @click=${() => this._changeByStep(field2, 1)}>+</button>
          <div class="num-value">${formatValue(value, step)}</div>
        </div>
      </div>
    `;
  }
  _renderEntity(field2) {
    const value = this._fieldValue(field2) || "";
    const domain = field2.domain || null;
    const domains = domain ? [domain] : void 0;
    return q`
      <div class="field">
        <div class="field-head">
          <div class="field-label">
            ${field2.label}
            ${field2.required ? q`<span style="color:#f87171;margin-left:4px;">*</span>` : ""}
          </div>
          ${this._renderReset(field2)}
        </div>
        ${this.hass ? q`
              <ha-entity-picker
                .hass=${this.hass}
                .value=${value}
                .includeDomains=${domains}
                .allowCustomEntity=${true}
                @value-changed=${(e2) => this._setValue(field2, e2.detail?.value ?? "")}
              ></ha-entity-picker>
            ` : q`
              <input
                class="text-input"
                type="text"
                placeholder=${domain ? `${domain}.my_entity` : "domain.entity_id"}
                .value=${value}
                @change=${(e2) => this._setValue(field2, e2.target.value)}
                @blur=${(e2) => this._setValue(field2, e2.target.value)}
              />
            `}
      </div>
    `;
  }
  _renderField(field2) {
    if (field2.type === "tog") return this._renderToggle(field2);
    if (field2.type === "select") return this._renderSelect(field2);
    if (field2.type === "num") return this._renderNumber(field2);
    if (field2.type === "entity") return this._renderEntity(field2);
    return this._renderText(field2);
  }
  render() {
    const optionSections = Array.isArray(EDITOR_SCHEMA) ? EDITOR_SCHEMA : [];
    if (!this._openSections || typeof this._openSections !== "object") {
      this._openSections = buildInitialSections();
    }
    return q`
      <div class="editor">
        <div class="entities-hint" style="margin-bottom:10px;opacity:0.75;font-size:12px;line-height:1.4;">
          Сутності налаштовуються лише на сторінці пристрою Smart Dehumidifier.
          Картка підтягує їх автоматично.
        </div>

        ${optionSections.map((section2) => {
      const isOpen = !!this._openSections[section2.id];
      return q`
            <div class="section">
              <button class="section-head" type="button" @click=${() => this._toggleSection(section2.id)}>
                <span class="section-emoji">${section2.em}</span>
                <span class="section-title">${this._sectionTitle(section2)}</span>
                <span class="section-arrow ${isOpen ? "open" : ""}">▼</span>
              </button>
              ${isOpen ? q`<div class="section-body">${section2.fields.map((f2) => this._renderField(f2))}</div>` : q``}
            </div>
          `;
    })}
        <div class="editor-ver">editor ${EDITOR_VERSION}</div>
      </div>
    `;
  }
};
__publicField(DehumidifierEditor, "properties", {
  hass: {},
  _config: { state: true },
  _openSections: { state: true },
  _drafts: { state: true }
});
__publicField(DehumidifierEditor, "styles", r`
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
  `);
if (!customElements.get("smart-dehumidifier-editor")) {
  customElements.define("smart-dehumidifier-editor", DehumidifierEditor);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c2) => c2.type === "smart-dehumidifier")) {
  window.customCards.push({
    type: "smart-dehumidifier",
    name: "Smart Dehumidifier",
    description: "Premium dehumidifier card with entity pickers",
    preview: true,
    documentationURL: "https://github.com/kdinya/Smart-Dehumidifier"
  });
}

// entry-bundle.js
console.info("%c Smart Dehumidifier %c bundled ", "background:#0f1720;color:#7dd3fc;padding:2px 8px;", "background:#111827;color:#e5e7eb;padding:2px 8px;");
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
