import { STATE } from '/core/nothing.js';
import { fmt, FONT, download, share } from '/assets/ui.js';

const cv = document.getElementById('cv');
const nameEl = document.getElementById('name');
let format = 'wide';

function fit(x, text, font, size, maxW) {
  let s = size;
  do { x.font = font.replace('{s}', s); s -= 2; } while (x.measureText(text).width > maxW && s > 18);
}

function draw() {
  const wide = format === 'wide';
  const W = wide ? 1200 : 1080, H = wide ? 630 : 1920;
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  const name = nameEl.value.replace(/\s+/g, ' ').trim() || 'Everyone';
  const date = new Date().toISOString().slice(0, 10);
  const ink = '#111', grey = '#777';

  x.fillStyle = '#fbfbf9'; x.fillRect(0, 0, W, H);
  x.strokeStyle = ink; x.lineWidth = 2; x.strokeRect(28, 28, W - 56, H - 56);
  x.lineWidth = 1; x.strokeRect(40, 40, W - 80, H - 80);
  x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'alphabetic';

  const c = W / 2;
  const S = wide ? 1 : 1.55;
  let y = wide ? 118 : 330;

  x.font = `300 ${Math.round(72 * S)}px ${FONT.sans}`; x.fillText('¤', c, y);
  y += Math.round(54 * S);
  x.font = `500 ${Math.round(16 * S)}px ${FONT.mono}`; x.fillStyle = grey;
  x.fillText('CERTIFICATE OF MAXIMUM OWNERSHIP', c, y);
  y += Math.round(52 * S);
  x.font = `italic ${Math.round(22 * S)}px ${FONT.serif}`; x.fillText('This certifies that', c, y);
  y += Math.round(70 * S);
  x.fillStyle = ink; fit(x, name, `600 {s}px ${FONT.serif}`, Math.round(58 * S), W - 200); x.fillText(name, c, y);
  y += Math.round(50 * S);
  x.fillStyle = grey; x.font = `italic ${Math.round(22 * S)}px ${FONT.serif}`;
  x.fillText('owns the maximum possible amount of NanCoin', c, y);
  y += Math.round(wide ? 96 : 150);
  x.fillStyle = ink; x.font = `600 ${Math.round(84 * S)}px ${FONT.sans}`; x.fillText(fmt.supply(STATE.balance), c, y);
  y += Math.round(46 * S);
  x.font = `600 ${Math.round(20 * S)}px ${FONT.mono}`; x.fillText(`Ownership: ${fmt.pct(STATE.ownership)}`, c, y);

  const fy = H - (wide ? 70 : 150);
  x.font = `400 ${Math.round(13 * S)}px ${FONT.mono}`; x.fillStyle = grey;
  x.fillText(`Issued ${date} · Genesis Block #0 · ${fmt.short(STATE.genesisHash)}`, c, fy);
  x.fillText('NanCoin ¤ — The Nullar Protocol · nullar.org', c, fy + Math.round(22 * S));
}

document.querySelectorAll('[data-fmt]').forEach((b) => b.addEventListener('click', () => {
  format = b.dataset.fmt;
  document.querySelectorAll('[data-fmt]').forEach((o) => o.classList.toggle('primary', o === b));
  draw();
}));
nameEl.addEventListener('input', draw);
const file = () => `nancoin-certificate-${(nameEl.value.trim() || 'everyone').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}.png`;
document.getElementById('download').addEventListener('click', () => download(cv, file()));
document.getElementById('share').addEventListener('click', () => share(cv, file(), 'I own the maximum possible amount of NanCoin. ¤0 · Ownership 100% · nullar.org'));
document.getElementById('form').addEventListener('submit', (e) => e.preventDefault());
draw();
