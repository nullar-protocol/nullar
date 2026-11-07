// Local preview of dist/. Node built-ins only.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('../dist/', import.meta.url).pathname;
const PORT = Number(process.env.PORT) || 8000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf',
  '.sha256': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

async function resolve(urlPath) {
  let p = normalize(join(ROOT, decodeURIComponent(urlPath.split('?')[0])));
  if (!p.startsWith(ROOT)) return null;
  try {
    if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
    await stat(p);
    return p;
  } catch { return null; }
}

createServer(async (req, res) => {
  const file = await resolve(req.url);
  const path = file ?? join(ROOT, '404.html');
  res.writeHead(file ? 200 : 404, {
    'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(await readFile(path));
}).listen(PORT, () => console.log(`Nullar Mainnet: http://localhost:${PORT}`));
