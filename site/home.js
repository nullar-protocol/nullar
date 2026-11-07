import { claim } from '/core/nothing.js';
import { mountChart, fmt, show } from '/assets/ui.js';

mountChart(document.getElementById('chart-svg'));

const out = document.getElementById('claim-result');
document.getElementById('claim').addEventListener('click', () => {
  const r = claim();
  out.hidden = false;
  show(out, `Claim complete.\n\nReceived:  ${fmt.supply(r.received)}\nOwnership: ${fmt.pct(r.ownership)}`);
});
