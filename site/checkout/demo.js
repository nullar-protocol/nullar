const pay = document.getElementById('custom-pay');
const sync = () => {
  pay.setAttribute('item', document.getElementById('item').value);
  pay.setAttribute('merchant', document.getElementById('merchant').value);
};
document.getElementById('custom').addEventListener('input', sync);
document.getElementById('custom').addEventListener('submit', (e) => e.preventDefault());
sync();
