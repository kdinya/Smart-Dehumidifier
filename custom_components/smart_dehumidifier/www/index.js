import './dehumidifier-card.js?v=1.8.4';
import './dehumidifier-editor.js?v=1.8.4';

export const SMART_DEHUMIDIFIER_VERSION = '1.8.4';

console.info(
  `%c Smart Dehumidifier %c v${SMART_DEHUMIDIFIER_VERSION} `,
  'background:#0f1720;color:#7dd3fc;padding:2px 8px;border-radius:8px 0 0 8px;font-weight:700;',
  'background:#111827;color:#e5e7eb;padding:2px 8px;border-radius:0 8px 8px 0;font-weight:700;'
);

// Diagnostics for "Custom element not found"
try {
  const ok = !!customElements.get('smart-dehumidifier');
  if (!ok) {
    console.error(
      '[Smart Dehumidifier] custom element smart-dehumidifier was NOT defined after import. Check network tab for failed JS modules under /smart_dehumidifier_files/'
    );
  } else {
    console.info('[Smart Dehumidifier] custom element smart-dehumidifier is registered');
  }
} catch (e) {
  console.error('[Smart Dehumidifier] registration check failed', e);
}
