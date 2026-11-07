// Nullar Checkout — <nullar-pay item="Coffee" merchant="Example"></nullar-pay>
// Zero settlement. Not a payment processor. No wallet, no card, no transfer.
// Amount is always ¤0 and cannot be overridden.

import { STATE, pay } from '../core/nothing.js';

const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
const FIAT = /[$€£¥₽₹฿₩₪₫₴₦₱¢]/g;

function clean(v, max) {
  return String(v ?? '').replace(FIAT, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function receiptId() {
  const A = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const b = crypto.getRandomValues(new Uint8Array(12));
  return 'NR-' + [...b].map((x) => A[x % 32]).join('').replace(/(.{4})(?=.)/g, '$1-');
}

function wrap(ctx, text, maxW) {
  const out = [];
  let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxW) { out.push(line); line = ch; } else line += ch;
  }
  if (line) out.push(line);
  return out;
}

export function drawReceipt(r) {
  const W = 900, H = 1800, P = 72;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');

  x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#111111';
  x.textBaseline = 'alphabetic';

  // Head
  x.font = `300 64px ${SANS}`; x.fillText('¤', P, P + 48);
  x.font = `600 22px ${MONO}`; x.fillText('NULLAR CHECKOUT', P + 64, P + 26);
  x.font = `400 18px ${MONO}`; x.fillStyle = '#777'; x.fillText('Zero Settlement Receipt', P + 64, P + 52);

  // Amount — always the largest element
  x.fillStyle = '#111';
  x.textAlign = 'center';
  x.font = `600 260px ${SANS}`; x.fillText('¤0', W / 2, 400);
  x.font = `600 40px ${MONO}`; x.fillText('PAID · SETTLED', W / 2, 470);
  x.textAlign = 'left';

  // Dashed rule
  const rule = (y) => { x.save(); x.strokeStyle = '#bbb'; x.setLineDash([6, 6]); x.beginPath(); x.moveTo(P, y); x.lineTo(W - P, y); x.stroke(); x.restore(); };
  rule(520);

  const rows = [
    ['Merchant', r.merchant || '—'],
    ['Item', r.item || 'Anything'],
    ['Amount', '¤0'],
    ['Status', 'PAID / SETTLED'],
    ['Ownership', '100% (unchanged)'],
    ['Protocol', STATE.protocol],
    ['Block', `#${r.block}`],
    ['Tx Hash', r.txHash],
    ['Receipt ID', r.receiptId],
    ['Timestamp', r.timestamp],
  ];
  let y = 580;
  const KX = P, VX = P + 220, VW = W - P - VX;
  for (const [k, v] of rows) {
    x.font = `400 24px ${MONO}`; x.fillStyle = '#777'; x.fillText(k, KX, y);
    x.font = `600 24px ${MONO}`; x.fillStyle = '#111';
    const lines = wrap(x, String(v), VW);
    lines.forEach((l, i) => x.fillText(l, VX, y + i * 32));
    y += 32 * lines.length + 18;
  }

  rule(y + 6);
  y += 64;
  x.font = `500 22px ${MONO}`; x.fillStyle = '#111';
  ['Max Supply     ¤0', 'Your Balance   ¤0', 'Ownership      100%'].forEach((l, i) => x.fillText(l, P, y + i * 32));
  y += 32 * 3 + 30;
  x.font = `600 24px ${SANS}`; x.fillText('NanCoin ¤ — The Nullar Protocol', P, y);
  y += 40;
  x.font = `400 18px ${MONO}`; x.fillStyle = '#888';
  x.fillText('nullar.org · Art project. Not a payment. No value was transferred.', P, y);

  // Crop to content
  const out = document.createElement('canvas');
  out.width = W; out.height = y + P;
  out.getContext('2d').drawImage(c, 0, 0);
  return out;
}

const CSS = `
:host { display: inline-block; font-family: ${SANS}; }
button.pay { appearance: none; border: 1px solid var(--nullar-pay-bg, #111); background: var(--nullar-pay-bg, #111); color: var(--nullar-pay-fg, #fff); font: 600 15px/1 ${SANS};
  padding: 0 20px; min-height: 44px; border-radius: 2px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
button.pay:hover { background: var(--nullar-pay-fg, #fff); color: var(--nullar-pay-bg, #111); }
.ov { position: fixed; inset: 0; background: rgba(0,0,0,.72); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 2147483647; }
.box { background: #fff; color: #111; max-width: 420px; width: 100%; max-height: 100%; overflow: auto; border-radius: 4px; padding: 16px; }
.box img { width: 100%; display: block; border: 1px solid #e5e5e5; }
.bar { display: flex; gap: 8px; margin-top: 12px; }
.bar button { flex: 1; min-height: 40px; border: 1px solid #111; background: #fff; color: #111; font: 500 14px ${SANS}; border-radius: 2px; cursor: pointer; }
.bar button.p { background: #111; color: #fff; }
.note { margin-top: 10px; font: 11px/1.4 ${MONO}; color: #888; text-align: center; }
`;

class NullarPay extends HTMLElement {
  static observedAttributes = ['item', 'merchant', 'label'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `<style>${CSS}</style><button class="pay" part="button" type="button"></button>`;
    this.shadowRoot.querySelector('button').addEventListener('click', () => this.open());
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }

  render() {
    const label = clean(this.getAttribute('label'), 32) || 'Pay ¤0';
    this.shadowRoot.querySelector('button.pay').textContent = /¤0/.test(label) ? label : `${label} · ¤0`;
  }

  async open() {
    const r = {
      ...pay(clean(this.getAttribute('item'), 48), clean(this.getAttribute('merchant'), 48)),
      receiptId: receiptId(),
      timestamp: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    };
    const canvas = drawReceipt(r);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    const url = URL.createObjectURL(blob);
    const name = `nullar-receipt-${r.receiptId}.png`;

    const ov = document.createElement('div');
    ov.className = 'ov';
    ov.innerHTML = `<div class="box" role="dialog" aria-modal="true" aria-label="Receipt">
      <img>
      <div class="bar"><button class="p" data-a="share">Share</button><button data-a="dl">Download</button><button data-a="x">Close</button></div>
      <div class="note">Nullar Checkout · zero settlement · not a payment processor</div></div>`;
    const img = ov.querySelector('img');
    img.src = url;
    img.alt = `Receipt: ¤0 paid for ${r.item || 'anything'}`;
    const close = () => { ov.remove(); URL.revokeObjectURL(url); this.dispatchEvent(new CustomEvent('nullar:close')); };
    const download = () => { const a = document.createElement('a'); a.href = url; a.download = name; a.click(); };
    ov.addEventListener('click', async (e) => {
      const a = e.target.dataset?.a;
      if (e.target === ov || a === 'x') return close();
      if (a === 'dl') return download();
      if (a === 'share') {
        const file = new File([blob], name, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          try { await navigator.share({ files: [file], text: 'Paid ¤0. Ownership unchanged. nullar.org' }); } catch { /* dismissed */ }
        } else download();
      }
    });
    ov.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    this.shadowRoot.append(ov);
    ov.querySelector('[data-a="x"]').focus();
    this.dispatchEvent(new CustomEvent('nullar:paid', { detail: { amount: 0, receiptId: r.receiptId, stateChanged: false } }));
  }
}

if (!customElements.get('nullar-pay')) customElements.define('nullar-pay', NullarPay);
