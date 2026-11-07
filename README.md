# NanCoin ¤ — The Nullar Protocol

The world’s first cryptocurrency pegged to absolute zero.

```text
Protocol:      Nullar
Currency:      NanCoin
Symbol:        ¤
Ticker:        None
Consensus:     Proof of Nothing

Maximum Supply: ¤0
Your Balance:   ¤0
Ownership:      100%
```

**You already own the maximum.**

```text
Current Version: 0.0.0
Status:          Complete
Dependencies:    0
```

---

## Genesis Block #0

```text
Timestamp:  2026-11-06T15:26:25Z
Message:    The Block 05/Nov/2026 Bitcoin erases post-election gains
            as Wall Street selloff triggers over $1 billion in crypto liquidations
SHA-256:    da4198d55bbba273dd4b9bb6e28e20108b72af9facd1552eb6c94af6d09d6dd4
```

Verify:

```sh
shasum -a 256 -c genesis/genesis.sha256
```

`genesis/genesis.json` never changes. A different genesis is a different protocol.

## Run

```sh
npm test      # protocol invariants: ∀a: B(a) = S = 0
npm start     # build dist/ and serve http://localhost:8000
```

No packages are installed. Node 24+ (built-ins only; CI runs on Node 26) and any modern browser.

## Layout

```text
protocol.json         single source of every number on the site
core/nothing.js       reference implementation of the protocol
core/nothing.test.js  invariants
genesis/              Block #0 and its hash
checkout/             Nullar Checkout — <nullar-pay> web component
packages/checkout/    npm package @nullar/checkout (sh scripts/pack-checkout.sh)
site/                 static pages
whitepaper/           PDF (rendered from /whitepaper/)
scripts/              local preview, OG image and PDF rendering
build.sh              copies everything into dist/ — no bundler
```

## Deploy (Cloudflare Pages)

```text
Build command:     sh build.sh
Output directory:  dist
```

Security headers and CORS for the embeddable checkout are in `site/_headers`.

## Nullar Checkout

```html
<script type="module" src="https://nullar.org/checkout/nullar-pay.js"></script>
<nullar-pay item="Coffee" merchant="Your Shop"></nullar-pay>
```

The amount is ¤0 and cannot be changed.

## License

CC0 1.0 Universal. The protocol holds nothing back.

---

NanCoin is a conceptual art project. It has no monetary value, provides no financial rights, makes no promises of profit and is not offered as an investment. No purchase is necessary. Everyone already owns the maximum possible amount.
