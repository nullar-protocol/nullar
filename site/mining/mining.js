import { mine } from '/core/nothing.js';
import { fmt, show } from '/assets/ui.js';

const out = document.getElementById('out');
document.getElementById('mine').addEventListener('click', () => {
  const r = mine();
  show(out, `Mining was already complete before you started.\n\nReward received: ${fmt.supply(r.reward)}\nOwnership:       ${fmt.pct(r.ownership)}\n\nMaximum ownership maintained.`);
});
