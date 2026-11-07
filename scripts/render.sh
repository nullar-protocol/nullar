#!/bin/sh
# Regenerates site/og.png and whitepaper/nancoin-whitepaper.pdf with headless Chrome.
# Requires a running preview: `npm start` (port 8000) or PORT=xxxx.
set -eu
cd "$(dirname "$0")/.."
PORT="${PORT:-8000}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PROFILE="$PWD/.chrome-profile"
trap 'rm -rf "$PROFILE"' EXIT

cp scripts/og.html dist/_og.html
"$CHROME" --headless=new --user-data-dir="$PROFILE" --hide-scrollbars --virtual-time-budget=2000 \
  --window-size=1200,630 --screenshot=site/og.png "http://localhost:$PORT/_og.html"
rm dist/_og.html

mkdir -p whitepaper
"$CHROME" --headless=new --user-data-dir="$PROFILE" --virtual-time-budget=4000 --no-pdf-header-footer \
  --print-to-pdf=whitepaper/nancoin-whitepaper.pdf "http://localhost:$PORT/whitepaper/"

echo "site/og.png and whitepaper/nancoin-whitepaper.pdf updated. Run sh build.sh again."
