// Shared UI for the Nullar site. Every number on every page comes from protocol.json via core.
import { STATE } from '/core/nothing.js';

export { STATE };

export const fmt = {
  raw: (v) => String(v),
  supply: (v) => `¤${v}`,
  usd: (v) => `$${v}`,
  pct: (v) => `${Math.round(v * 100)}%`,
  none: (v) => (v === null || v === undefined ? 'None' : String(v)),
  short: (v) => `${String(v).slice(0, 10)}…${String(v).slice(-6)}`,
  hs: (v) => `${v} H/s`,
  w: (v) => `${v} W`,
  kwh: (v) => `${v} kWh`,
};

const NAV = [
  ['/wallet/', 'Wallet', '¤', 'Wallet'],
  ['/explorer/', 'Explorer', '#', 'Explorer'],
  ['/mining/', 'Mining', '∅', 'Mining'],
  ['/checkout/', 'Checkout', '✓', 'Pay'],
  ['/certificate/', 'Certificate', '◎', 'Certificate'],
  ['/whitepaper/', 'Whitepaper', '¶', 'Paper'],
];

const FOOT = [
  ['/tokenomics/', 'Tokenomics'],
  ['/roadmap/', 'Roadmap'],
  ['/faq/', 'FAQ'],
  ['/status/', 'Status'],
  ['/legal/', 'Legal'],
];

const SOCIAL = [
  ['https://x.com/nullar_protocol', 'X'],
  ['https://t.me/nullar_protocol', 'Telegram'],
  ['https://instagram.com/nullar_protocol', 'Instagram'],
  ['https://github.com/nullar-protocol', 'GitHub'],
];

function link([href, label], here) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  if (here && location.pathname.startsWith(href)) a.setAttribute('aria-current', 'page');
  if (href.startsWith('http')) a.rel = 'noopener';
  return a;
}

function header() {
  const h = document.createElement('header');
  h.className = 'hdr';
  h.innerHTML = `<div class="wrap"><a class="brand" href="/"><span class="sym" aria-hidden="true">¤</span><span>Nullar</span></a><nav class="nav" aria-label="Main"></nav></div>`;
  const nav = h.querySelector('nav');
  NAV.forEach((n) => nav.append(link(n, true)));
  return h;
}

// Mobile: the main nav lives in a bottom tab bar instead of the header.
function tabbar() {
  const t = document.createElement('nav');
  t.className = 'tabbar';
  t.setAttribute('aria-label', 'Main');
  NAV.forEach(([href, label, icon, short]) => {
    const a = link([href, label], true);
    a.textContent = '';
    const i = document.createElement('span'); i.className = 'ti'; i.setAttribute('aria-hidden', 'true'); i.textContent = icon;
    const l = document.createElement('span'); l.className = 'tl'; l.textContent = short;
    a.append(i, l);
    a.setAttribute('aria-label', label);
    t.append(a);
  });
  return t;
}

function footer() {
  const f = document.createElement('footer');
  f.className = 'ftr';
  f.innerHTML = `<div class="wrap">
    <div class="cols">
      <div><strong>NanCoin ¤ — The Nullar Protocol</strong><div class="faint mono mt-1">v<span data-p="version"></span> · Status: <span data-p="status"></span></div></div>
      <nav class="site" aria-label="Protocol"></nav>
      <nav class="social" aria-label="Channels"></nav>
    </div>
    <p class="disc">NanCoin is a conceptual art project. It has no monetary value, provides no financial rights, makes no promises of profit and is not offered as an investment. No purchase is necessary. Everyone already owns the maximum possible amount.</p>
  </div>`;
  FOOT.forEach((n) => f.querySelector('nav.site').append(link(n)));
  SOCIAL.forEach((n) => f.querySelector('nav.social').append(link(n)));
  return f;
}

export function bind(root = document) {
  root.querySelectorAll('[data-p]').forEach((el) => {
    const f = fmt[el.dataset.f || 'raw'] || fmt.raw;
    el.textContent = f(STATE[el.dataset.p]);
  });
}

export function show(el, text) {
  el.textContent = text;
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

// ---------- Canvas export ----------

export function toBlob(canvas) {
  return new Promise((r) => canvas.toBlob(r, 'image/png'));
}

export async function download(canvas, name) {
  const url = URL.createObjectURL(await toBlob(canvas));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function share(canvas, name, text) {
  const file = new File([await toBlob(canvas)], name, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], text }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  await download(canvas, name);
}

export const FONT = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  serif: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
};

// ---------- Live price chart ----------

export function mountChart(el) {
  const N = 60;
  const W = 600, H = 150, PAD = 8;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H + 22}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'NanCoin price, live: $0');
  const grid = document.createElementNS(svgNS, 'g');
  for (let i = 0; i <= 4; i++) {
    const y = PAD + ((H - PAD * 2) / 4) * i;
    const l = document.createElementNS(svgNS, 'line');
    Object.entries({ x1: 0, x2: W, y1: y, y2: y, stroke: 'var(--line)', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }).forEach(([k, v]) => l.setAttribute(k, v));
    grid.append(l);
  }
  const path = document.createElementNS(svgNS, 'polyline');
  Object.entries({ fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }).forEach(([k, v]) => path.setAttribute(k, v));
  const labels = document.createElementNS(svgNS, 'g');
  svg.append(grid, path, labels);
  el.append(svg);

  const price = STATE.marketValueUsd;
  const points = Array.from({ length: N }, () => price);
  const yOf = () => H - PAD; // $0 sits on the floor of the chart. It always will.

  function draw() {
    path.setAttribute('points', points.map((p, i) => `${(i / (N - 1)) * W},${yOf(p)}`).join(' '));
    labels.replaceChildren();
    const now = Date.now();
    [0, 20, 40, 59].forEach((i) => {
      const t = document.createElementNS(svgNS, 'text');
      const d = new Date(now - (N - 1 - i) * 1000);
      t.textContent = d.toTimeString().slice(0, 8);
      t.setAttribute('x', (i / (N - 1)) * W);
      t.setAttribute('y', H + 18);
      t.setAttribute('class', 'axis');
      t.setAttribute('text-anchor', i === 0 ? 'start' : i === 59 ? 'end' : 'middle');
      labels.append(t);
    });
  }
  draw();
  setInterval(() => { points.shift(); points.push(price); draw(); }, 1000);
}

// ---------- Boot ----------

document.body.prepend(header());
document.body.append(tabbar());
document.body.append(footer());
bind();
