// Regenerates SEO metadata in site/**/index.html and writes site/sitemap.xml.
// Idempotent: everything between the SEO markers is rebuilt from <title> and the description.
// Run: node scripts/seo.js   (then commit site/)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ORIGIN = 'https://nullar.org';
const SITE = new URL('../site/', import.meta.url).pathname;
const START = '<!-- seo -->';
const END = '<!-- /seo -->';
const TODAY = new Date().toISOString().slice(0, 10);

const ORG = {
  '@type': 'Organization',
  '@id': `${ORIGIN}/#org`,
  name: 'Nullar Protocol',
  url: `${ORIGIN}/`,
  logo: `${ORIGIN}/icon-512.png`,
  email: 'hello@nullar.org',
  sameAs: [
    'https://x.com/nullar_protocol',
    'https://t.me/nullar_protocol',
    'https://instagram.com/nullar_protocol',
    'https://github.com/nullar-protocol',
    'https://www.npmjs.com/org/nullar',
  ],
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function pages(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...pages(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function jsonld(path, title, description, html) {
  const url = `${ORIGIN}${path}`;
  const graph = [];
  if (path === '/') {
    graph.push(ORG, {
      '@type': 'WebSite',
      '@id': `${ORIGIN}/#website`,
      name: 'NanCoin ¤ — The Nullar Protocol',
      url: `${ORIGIN}/`,
      description,
      publisher: { '@id': `${ORIGIN}/#org` },
      inLanguage: 'en',
      license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    });
  }
  graph.push({
    '@type': path === '/faq/' ? ['WebPage', 'FAQPage'] : 'WebPage',
    '@id': `${url}#page`,
    url,
    name: title,
    description,
    isPartOf: { '@id': `${ORIGIN}/#website` },
    publisher: { '@id': `${ORIGIN}/#org` },
    inLanguage: 'en',
    ...(path === '/faq/' && {
      mainEntity: [...html.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map((m) => ({
        '@type': 'Question',
        name: text(m[1]),
        acceptedAnswer: { '@type': 'Answer', text: text(m[2]) },
      })),
    }),
  });
  if (path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Nullar', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: title.split(' — ')[0], item: url },
      ],
    });
  }
  // Escape "<" so the JSON can never close the script element.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

const urls = [];
for (const file of pages(SITE)) {
  const rel = relative(SITE, file);
  let html = readFileSync(file, 'utf8');
  const is404 = rel === '404.html';
  const path = '/' + rel.replace(/index\.html$/, '');
  const title = html.match(/<title>([^<]*)<\/title>/)[1];
  const description = (html.match(/<meta name="description" content="([^"]*)">/) || [, 'NanCoin is a conceptual cryptocurrency pegged to absolute zero. You already own the maximum.'])[1];

  // Drop previously generated block and any hand-written OG/Twitter/canonical tags.
  html = html.replace(new RegExp(`\\n?${START}[\\s\\S]*?${END}`), '');
  html = html.replace(/\n<meta (property="og:|name="twitter:|name="theme-color"|name="robots")[^>]*>/g, '');
  html = html.replace(/\n<link rel="(canonical|apple-touch-icon|manifest|alternate)"[^>]*>/g, '');
  if (!/<meta name="description"/.test(html)) {
    html = html.replace(/(<title>[^<]*<\/title>)/, `$1\n<meta name="description" content="${esc(description)}">`);
  }

  const url = `${ORIGIN}${path}`;
  const tags = is404
    ? [`<meta name="robots" content="noindex">`]
    : [
        `<link rel="canonical" href="${url}">`,
        `<meta property="og:type" content="${path === '/whitepaper/' ? 'article' : 'website'}">`,
        `<meta property="og:site_name" content="Nullar Protocol">`,
        `<meta property="og:title" content="${esc(title)}">`,
        `<meta property="og:description" content="${esc(description)}">`,
        `<meta property="og:url" content="${url}">`,
        `<meta property="og:image" content="${ORIGIN}/og.png">`,
        `<meta property="og:image:width" content="1200">`,
        `<meta property="og:image:height" content="630">`,
        `<meta property="og:image:alt" content="NanCoin ¤ — Max Supply ¤0, Your Balance ¤0, Ownership 100%. You already own the maximum.">`,
        `<meta property="og:locale" content="en_US">`,
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:site" content="@nullar_protocol">`,
        `<meta name="twitter:title" content="${esc(title)}">`,
        `<meta name="twitter:description" content="${esc(description)}">`,
        `<meta name="twitter:image" content="${ORIGIN}/og.png">`,
        `<script type="application/ld+json">${jsonld(path, title, description, html)}</script>`,
      ];
  tags.push(
    `<meta name="theme-color" content="#0b0b0b">`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    `<link rel="manifest" href="/site.webmanifest">`,
    `<link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt">`,
  );
  const block = `${START}\n${tags.join('\n')}\n${END}`;
  html = html.replace(/(<meta name="description" content="[^"]*">)/, `$1\n${block}`);
  writeFileSync(file, html);
  if (!is404) urls.push(path);
}

const prio = (p) => (p === '/' ? '1.0' : ['/wallet/', '/explorer/', '/checkout/', '/whitepaper/'].includes(p) ? '0.8' : '0.6');
urls.sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${ORIGIN}${p}</loc><lastmod>${TODAY}</lastmod><priority>${prio(p)}</priority></url>`).join('\n')}
  <url><loc>${ORIGIN}/whitepaper/nancoin-whitepaper.pdf</loc><lastmod>${TODAY}</lastmod><priority>0.5</priority></url>
</urlset>
`;
writeFileSync(join(SITE, 'sitemap.xml'), sitemap);
console.log(`SEO updated: ${urls.length} pages + 404; sitemap.xml written.`);
