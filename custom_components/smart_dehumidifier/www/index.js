/* Smart Dehumidifier card — single bundled entry (no relative multi-file imports). */
import './smart-dehumidifier.js';
export const SMART_DEHUMIDIFIER_VERSION = '1.8.5';
console.info(
  `%c Smart Dehumidifier %c v${SMART_DEHUMIDIFIER_VERSION} `,
  'background:#0f1720;color:#7dd3fc;padding:2px 8px;border-radius:8px 0 0 8px;font-weight:700;',
  'background:#111827;color:#e5e7eb;padding:2px 8px;border-radius:0 8px 8px 0;font-weight:700;'
);
if (customElements.get('smart-dehumidifier')) {
  console.info('[Smart Dehumidifier] element registered OK');
} else {
  console.error('[Smart Dehumidifier] element NOT registered — check /smart_dehumidifier_files/smart-dehumidifier.js');
}
