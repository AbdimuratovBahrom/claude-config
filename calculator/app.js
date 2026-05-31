let current = '0';
let previous = null;
let operator = null;
let shouldReset = false;

const resultEl = document.getElementById('result');
const expressionEl = document.getElementById('expression');

function updateDisplay() {
  resultEl.textContent = current;
  resultEl.classList.toggle('small', current.length > 9);
}

function inputNum(digit) {
  if (shouldReset) {
    current = digit;
    shouldReset = false;
  } else {
    current = current === '0' ? digit : current + digit;
  }
  if (current.length > 12) return;
  updateDisplay();
}

function inputDot() {
  if (shouldReset) {
    current = '0.';
    shouldReset = false;
  } else if (!current.includes('.')) {
    current += '.';
  }
  updateDisplay();
}

function inputOp(op) {
  const symbols = { '/': '÷', '*': '×', '-': '−', '+': '+' };
  if (operator && !shouldReset) calculate(true);
  previous = parseFloat(current);
  operator = op;
  shouldReset = true;
  expressionEl.textContent = `${previous} ${symbols[op]}`;
  document.querySelectorAll('.btn-operator').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === symbols[op]);
  });
}

function calculate(chained = false) {
  if (operator === null || previous === null) return;
  const a = previous;
  const b = parseFloat(current);
  const symbols = { '/': '÷', '*': '×', '-': '−', '+': '+' };
  if (!chained) expressionEl.textContent = `${a} ${symbols[operator]} ${b} =`;
  let result;
  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = b === 0 ? 'Ошибка' : a / b; break;
  }
  current = result === 'Ошибка' ? 'Ошибка' : String(parseFloat(result.toFixed(10)));
  operator = null;
  previous = null;
  shouldReset = !chained;
  updateDisplay();
  document.querySelectorAll('.btn-operator').forEach(b => b.classList.remove('active'));
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  shouldReset = false;
  expressionEl.textContent = '';
  document.querySelectorAll('.btn-operator').forEach(b => b.classList.remove('active'));
  updateDisplay();
}

function toggleSign() {
  if (current === '0' || current === 'Ошибка') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
  updateDisplay();
}

function percent() {
  const val = parseFloat(current);
  current = String(previous !== null ? (previous * val) / 100 : val / 100);
  updateDisplay();
}

document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') inputNum(e.key);
  else if (e.key === '.') inputDot();
  else if (e.key === '+') inputOp('+');
  else if (e.key === '-') inputOp('-');
  else if (e.key === '*') inputOp('*');
  else if (e.key === '/') { e.preventDefault(); inputOp('/'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === 'Backspace') {
    if (current.length > 1) current = current.slice(0, -1);
    else current = '0';
    updateDisplay();
  }
});
