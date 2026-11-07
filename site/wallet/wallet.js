import { STATE, claim, send, recover } from '/core/nothing.js';
import { fmt, show } from '/assets/ui.js';

const $ = (id) => document.getElementById(id);

$('amt').value = fmt.supply(STATE.balance);
$('fee').value = fmt.supply(STATE.fee);

$('claim').addEventListener('click', () => {
  const r = claim();
  $('claim-out').hidden = false;
  show($('claim-out'), `Claim complete.\n\nReceived:  ${fmt.supply(r.received)}\nOwnership: ${fmt.pct(r.ownership)}`);
});

$('send').addEventListener('submit', (e) => {
  e.preventDefault();
  const to = $('to').value.trim() || 'Anyone';
  const r = send(to, 0);
  show($('send-out'),
    `Transaction successful.\n\nTo:       ${r.recipient}\nSent:     ${fmt.supply(r.sent)}\nReceived: ${fmt.supply(r.received)}\nFee:      ${fmt.supply(r.fee)}\n\nBoth parties still own the maximum possible amount.`);
});

$('recover').addEventListener('submit', (e) => {
  e.preventDefault();
  const r = recover($('seed').value);
  show($('recover-out'), `Recovery successful.\n\nBalance:   ${fmt.supply(r.balance)}\nOwnership: ${fmt.pct(r.ownership)}`);
});
