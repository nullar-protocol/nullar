import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as N from './nothing.js';

const { STATE } = N;
const root = new URL('../', import.meta.url);

test('main invariant: ∀a: B(a) = S = 0', () => {
  for (const a of ['', 'satoshi', '0x0000000000000000000000000000000000000000', '🙂', null, undefined]) {
    assert.equal(N.getBalance(a), STATE.maximumSupply);
    assert.equal(N.getBalance(a), 0);
  }
});

test('everyone owns the maximum', () => {
  for (const a of ['alice', 'bob', 'everyone', 'no one']) assert.equal(N.getOwnership(a), 1);
});

test('ownership is the only non-zero value', () => {
  const numbers = Object.entries(STATE).filter(([, v]) => typeof v === 'number');
  const nonZero = numbers.filter(([k, v]) => v !== 0 && k !== 'totalBlocks');
  assert.deepEqual(nonZero, [['ownership', 1]]);
  assert.equal(STATE.totalBlocks, 1, 'there is exactly one block');
});

test('no ticker, no official contract', () => {
  assert.equal(STATE.ticker, null);
  assert.equal(STATE.officialContract, null);
});

test('state is frozen', () => {
  assert.ok(Object.isFrozen(STATE));
  assert.throws(() => { 'use strict'; STATE.totalSupply = 1; });
  assert.equal(STATE.totalSupply, 0);
});

test('no function changes the state', () => {
  const before = JSON.stringify(STATE);
  const results = [N.mine(), N.claim(), N.send('x'), N.send('x', 1), N.recover('any seed'), N.pay('Coffee'), N.search('x')];
  for (const r of results.slice(0, 6)) assert.equal(r.stateChanged, false);
  assert.equal(JSON.stringify(STATE), before);
});

test('mining was complete before it started', () => {
  const r = N.mine();
  assert.equal(r.reward, 0);
  assert.equal(r.completedBeforeStart, true);
});

test('only ¤0 can be sent', () => {
  assert.equal(N.send('bob', 0).ok, true);
  assert.equal(N.send('bob', 0).fee, 0);
  assert.equal(N.send('bob', 1).ok, false);
  assert.equal(N.send('bob', -1).ok, false);
  assert.equal(N.send('bob', 0.000001).ok, false);
});

test('recovery always succeeds', () => {
  for (const s of ['', 'nothing nothing nothing', 'wrong words']) assert.equal(N.recover(s).ok, true);
});

test('checkout: amount is always ¤0, tx hash is genesis', () => {
  const r = N.pay('Coffee', 'Example');
  assert.equal(r.amount, 0);
  assert.equal(r.status, 'PAID');
  assert.equal(r.txHash, STATE.genesisHash);
  assert.equal(r.ownershipBefore, r.ownershipAfter);
});

test('explorer search', () => {
  assert.equal(N.search('0').kind, 'block');
  assert.equal(N.search('#0').found, true);
  assert.equal(N.search(STATE.genesisHash).found, true);
  assert.deepEqual(N.search('1'), { kind: 'block', height: 1, found: false });
  assert.equal(N.search('ab'.repeat(32)).kind, 'transaction');
  assert.equal(N.search('0x' + 'a'.repeat(40)).kind, 'contract');
  assert.equal(N.search('So11111111111111111111111111111111111111112').kind, 'contract');
  const a = N.search('vitalik.eth');
  assert.equal(a.kind, 'address');
  assert.equal(a.balance, 0);
  assert.equal(a.ownership, 1);
});

test('genesis hash in protocol.json matches genesis.json and genesis.sha256', async () => {
  const bytes = await readFile(new URL('genesis/genesis.json', root));
  const actual = createHash('sha256').update(bytes).digest('hex');
  const recorded = (await readFile(new URL('genesis/genesis.sha256', root), 'utf8')).split(/\s+/)[0];
  assert.equal(actual, recorded);
  assert.equal(actual, STATE.genesisHash);
});

test('genesis block is final', async () => {
  const g = JSON.parse(await readFile(new URL('genesis/genesis.json', root), 'utf8'));
  assert.equal(g.blockHeight, 0);
  assert.deepEqual(g.transactions, []);
  assert.equal(g.blockReward, 0);
  assert.equal(g.totalSupply, 0);
  assert.equal(g.previousHash, null);
  assert.equal(g.nextBlock, null);
});
