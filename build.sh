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
echo "dist/ ready"
