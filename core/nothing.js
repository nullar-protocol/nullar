// Nullar Protocol — reference implementation.
// The complete state of the network. It does not change.

import protocol from '../protocol.json' with { type: 'json' };

function deepFreeze(o) {
  for (const v of Object.values(o)) if (v && typeof v === 'object') deepFreeze(v);
  return Object.freeze(o);
}

export const STATE = deepFreeze(structuredClone(protocol));

const UNCHANGED = Object.freeze({ stateChanged: false });

/** Balance of any address that exists or could exist. */
export function getBalance(_address) {
  return STATE.balance;
}

/** Share of the maximum supply owned by any address. */
export function getOwnership(_address) {
  return getBalance(_address) === STATE.maximumSupply ? 1 : 0;
}

/** Proof of Nothing. */
export function mine() {
  return { ...UNCHANGED, reward: 0, completedBeforeStart: true, ownership: getOwnership() };
}

/** Claim the maximum possible amount. */
export function claim() {
  return { ...UNCHANGED, received: 0, ownership: getOwnership() };
}

/** Send NanCoin. Only ¤0 can be sent. Nothing is recorded. */
export function send(recipient = '', amount = 0) {
  if (amount !== 0) {
    return { ...UNCHANGED, ok: false, error: 'Protocol violation: amount must be ¤0.' };
  }
  return {
    ...UNCHANGED,
    ok: true,
    recipient: String(recipient),
    sent: 0,
    received: 0,
    fee: 0,
    senderOwnership: getOwnership(),
    recipientOwnership: getOwnership(recipient),
  };
}

/** Recover a wallet from any seed phrase, including none. */
export function recover(_seed = '') {
  return { ...UNCHANGED, ok: true, balance: getBalance(), ownership: getOwnership() };
}

/** Pay ¤0 for anything. Settlement is immediate and changes nothing. */
export function pay(item = '', merchant = '') {
  return {
    ...UNCHANGED,
    item: String(item),
    merchant: String(merchant),
    amount: 0,
    status: 'PAID',
    block: STATE.blockHeight,
    txHash: STATE.genesisHash,
    ownershipBefore: getOwnership(),
    ownershipAfter: getOwnership(),
  };
}

const HEX64 = /^(0x)?[0-9a-f]{64}$/i;
const EVM = /^0x[0-9a-f]{40}$/i;
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{26,44}$/;

/** NanExplorer search. Every query has an answer. */
export function search(query = '') {
  const q = String(query).trim();
  const hash = q.toLowerCase().replace(/^0x/, '');

  if (q === '' || /^#?0+$/.test(q) || /^genesis$/i.test(q) || hash === STATE.genesisHash) {
    return { kind: 'block', height: 0, found: true };
  }
  if (/^#?\d+$/.test(q)) {
    return { kind: 'block', height: Number(q.replace('#', '')), found: false };
  }
  if (HEX64.test(q)) {
    return { kind: 'transaction', found: false };
  }
  if (EVM.test(q) || BASE58.test(q)) {
    return { kind: 'contract', official: false, officialContract: STATE.officialContract };
  }
  return { kind: 'address', found: true, address: q, balance: getBalance(q), ownership: getOwnership(q) };
}
