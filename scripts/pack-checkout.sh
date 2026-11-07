#!/bin/sh
# Assembles the @nullar/checkout npm package into npm/checkout/ (same relative layout as the site).
set -eu
cd "$(dirname "$0")/.."
OUT=npm/checkout
rm -rf "$OUT"; mkdir -p "$OUT/checkout" "$OUT/core"
cp packages/checkout/package.json packages/checkout/README.md LICENSE "$OUT/"
cp checkout/nullar-pay.js "$OUT/checkout/"
cp core/nothing.js "$OUT/core/"
cp protocol.json "$OUT/"
echo "$OUT ready. Publish: cd $OUT && npm publish --access public"
