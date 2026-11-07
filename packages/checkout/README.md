# @nullar/checkout

Nullar Checkout. A drop-in payment button for any website.

```text
Amount:   ¤0
Status:   PAID
Fees:     ¤0
Gateway:  None
```

## Install

```sh
npm i @nullar/checkout
```

```js
import '@nullar/checkout';
```

```html
<nullar-pay item="Coffee" merchant="Your Shop"></nullar-pay>
```

Or without a build step:

```html
<script type="module" src="https://nullar.org/checkout/nullar-pay.js"></script>
<nullar-pay item="Coffee" merchant="Your Shop"></nullar-pay>
```

## Attributes

| Attribute  | Meaning                       |
|------------|-------------------------------|
| `item`     | what is being bought          |
| `merchant` | who is selling (optional)     |
| `label`    | button text (¤0 always shown) |

There is no `amount` attribute. The amount is ¤0 and cannot be changed.

## Event

```js
document.querySelector('nullar-pay').addEventListener('nullar:paid', e => {
  e.detail; // { amount: 0, receiptId: 'NR-…', stateChanged: false }
});
```

## Core

```js
import { getBalance, mine, send } from '@nullar/checkout/core';
getBalance(); // 0
```

## What it is not

Not a payment processor. No card, no wallet, no transfer, no data collected. Every receipt carries the Genesis Block #0 hash as its transaction hash.

CC0 1.0. NanCoin is a conceptual art project with no monetary value. https://nullar.org
