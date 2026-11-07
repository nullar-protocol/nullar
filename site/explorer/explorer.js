import { STATE, search } from '/core/nothing.js';
import { fmt, show } from '/assets/ui.js';

const $ = (id) => document.getElementById(id);

// ---------- Block #0, verified live ----------

async function loadGenesis() {
  const res = await fetch('/genesis/genesis.json', { cache: 'no-cache' });
  const bytes = await res.arrayBuffer();
  const g = JSON.parse(new TextDecoder().decode(bytes));

  $('g-ts').textContent = g.timestamp;
  $('g-tx').textContent = String(g.transactions.length);
  $('g-reward').textContent = fmt.supply(g.blockReward);
  $('g-supply').textContent = fmt.supply(g.totalSupply);
  $('g-prev').textContent = fmt.none(g.previousHash);
  $('g-next').textContent = fmt.none(g.nextBlock);
  $('g-msg').textContent = g.message;

  if (crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
    $('g-verify').textContent = hex === STATE.genesisHash ? 'Yes — hash matches' : `Mismatch: ${hex}`;
  } else {
    $('g-verify').textContent = 'Unavailable in this browser';
  }
}
loadGenesis().catch(() => { $('g-verify').textContent = 'Unavailable'; });

// ---------- Search ----------

function answer(q) {
  const r = search(q);
  switch (r.kind) {
    case 'block':
      return r.found
        ? `Block #0 found.\n\nStatus:       Final\nFinality:     ${STATE.finality}\nTransactions: ${STATE.transactions}\nHash:         ${fmt.short(STATE.genesisHash)}`
        : `Block #${r.height} does not exist.\n\nThere is only one block.\nNo further blocks are required.`;
    case 'transaction':
      return 'No transaction found.\n\nNo transaction has ever been required.';
    case 'contract':
      return `Not NanCoin.\n\nOfficial Contract: ${fmt.none(r.officialContract)}\nAny token with supply above zero violates the protocol.`;
    case 'address':
      return `Address found.\n\nAddress:   ${r.address}\nBalance:   ${fmt.supply(r.balance)}\nOwnership: ${fmt.pct(r.ownership)}`;
  }
}

$('search').addEventListener('submit', (e) => {
  e.preventDefault();
  show($('search-out'), answer($('q').value));
});

const initial = new URLSearchParams(location.search).get('q');
if (initial !== null) { $('q').value = initial; show($('search-out'), answer(initial)); }
