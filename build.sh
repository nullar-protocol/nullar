#!/bin/sh
# Assembles the static site into dist/. No bundler, no dependencies — copy only.
# Cloudflare Pages: build command `sh build.sh`, output directory `dist`.
set -eu
cd "$(dirname "$0")"
rm -rf dist
mkdir -p dist
cp -R site/. dist/
cp protocol.json dist/
mkdir -p dist/core dist/genesis dist/checkout
cp core/nothing.js dist/core/
cp genesis/genesis.json genesis/genesis.sha256 dist/genesis/
cp checkout/nullar-pay.js dist/checkout/
if [ -f whitepaper/nancoin-whitepaper.pdf ]; then
  mkdir -p dist/whitepaper
  cp whitepaper/nancoin-whitepaper.pdf dist/whitepaper/
fi
# Cache-busting: browsers may keep /assets/* for hours. Stamp every root-relative
# .js/.css reference in our own pages with a content hash so a deploy shows up at once.
V=$(find site core checkout protocol.json -type f | LC_ALL=C sort | xargs cat | shasum | cut -c1-10)
find dist -name '*.html' -o -name '*.js' | grep -v '^dist/checkout/nullar-pay.js$' | grep -v '^dist/core/' | while read -r f; do
  sed -i.bak -E "s#([\"'])(/[A-Za-z0-9_./-]+\.(js|css))([\"'])#\1\2?v=$V\4#g" "$f" && rm "$f.bak"
done
echo "dist/ ready (v=$V)"
