let current = '0';
let previous = null;
let operator = null;
let shouldReset = false;
let history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
let scientificMode = false;

const resultEl     = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const historyList  = document.getElementById('historyList');
const historyPanel = document.getElementById('historyPanel');
const sciButtons   = document.getElementById('scientificButtons');
const modeToggle   = document.getElementById('modeToggle');

function updateDisplay() {
  resultEl.textContent = current;
  resultEl.classList.toggle('small', current.length > 9);
}

function inputNum(digit) {
  if (shouldReset) { current = digit; shouldReset = false; }
  else { current = current === '0' ? digit : current + digit; }
  if (current.length > 14) return;
  updateDisplay();
}

function inputDot() {
  if (shouldReset) { current = '0.'; shouldReset = false; }
  else if (!current.includes('.')) current += '.';
  updateDisplay();
}

function inputOp(op) {
  const sym = { '/':'÷', '*':'×', '-':'−', '+':'+' };
  if (operator && !shouldReset) calculate(true);
  previous = parseFloat(current);
  operator = op;
  shouldReset = true;
  expressionEl.textContent = `${previous} ${sym[op]}`;
  document.querySelectorAll('.btn-operator').forEach(b =>
    b.classList.toggle('active', b.textContent === sym[op])
  );
}

function calculate(chained = false) {
  if (operator === null || previous === null) return;
  const a = previous, b = parseFloat(current);
  const sym = { '/':'÷', '*':'×', '-':'−', '+':'+' };
  let result;
  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = b === 0 ? 'Ошибка' : a / b; break;
  }
  const exprText = `${a} ${sym[operator]} ${b}`;
  if (!chained) expressionEl.textContent = exprText + ' =';
  const resultStr = result === 'Ошибка' ? 'Ошибка' : String(parseFloat(result.toFixed(10)));
  if (!chained) addHistory(exprText, resultStr);
  current = resultStr;
  operator = null;
  previous = null;
  shouldReset = !chained;
  updateDisplay();
  document.querySelectorAll('.btn-operator').forEach(b => b.classList.remove('active'));
}

function sciOp(op) {
  const val = parseFloat(current);
  let result;
  switch (op) {
    case 'sin':  result = Math.sin(val * Math.PI / 180); break;
    case 'cos':  result = Math.cos(val * Math.PI / 180); break;
    case 'tan':  result = Math.tan(val * Math.PI / 180); break;
    case 'log':  result = val <= 0 ? 'Ошибка' : Math.log10(val); break;
    case 'ln':   result = val <= 0 ? 'Ошибка' : Math.log(val); break;
    case 'sqrt': result = val < 0  ? 'Ошибка' : Math.sqrt(val); break;
    case 'sq':   result = val * val; break;
    case 'inv':  result = val === 0 ? 'Ошибка' : 1 / val; break;
  }
  const exprText = `${op}(${val})`;
  expressionEl.textContent = exprText + ' =';
  const resultStr = result === 'Ошибка' ? 'Ошибка' : String(parseFloat(result.toFixed(10)));
  addHistory(exprText, resultStr);
  current = resultStr;
  shouldReset = true;
  updateDisplay();
}

function clearAll() {
  current = '0'; previous = null; operator = null; shouldReset = false;
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
  current = String(previous !== null ? (previous * parseFloat(current)) / 100 : parseFloat(current) / 100);
  updateDisplay();
}

/* ── История ── */
function addHistory(expr, res) {
  history.unshift({ expr, res });
  if (history.length > 30) history.pop();
  localStorage.setItem('calcHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = history.map((h, i) =>
    `<div class="history-item" onclick="useHistory(${i})">
       <div class="expr">${h.expr}</div>
       <div class="res">= ${h.res}</div>
     </div>`
  ).join('');
}

function useHistory(i) {
  current = history[i].res;
  shouldReset = true;
  updateDisplay();
}

function clearHistory() {
  history = [];
  localStorage.removeItem('calcHistory');
  renderHistory();
}

function toggleHistory() {
  historyPanel.classList.toggle('open');
  const btn = document.getElementById('historyToggle');
  btn.textContent = historyPanel.classList.contains('open') ? 'История ▴' : 'История ▾';
}

/* ── Научный режим ── */
modeToggle.addEventListener('click', () => {
  scientificMode = !scientificMode;
  sciButtons.classList.toggle('open', scientificMode);
  modeToggle.classList.toggle('active', scientificMode);
  modeToggle.textContent = scientificMode ? 'Обычный' : 'Научный';
});

/* ── Темы ── */
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('calcTheme', theme);
  });
});

/* ── Клавиатура ── */
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') inputNum(e.key);
  else if (e.key === '.')  inputDot();
  else if (e.key === '+')  inputOp('+');
  else if (e.key === '-')  inputOp('-');
  else if (e.key === '*')  inputOp('*');
  else if (e.key === '/') { e.preventDefault(); inputOp('/'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Escape')     clearAll();
  else if (e.key === 'Backspace') {
    current = current.length > 1 ? current.slice(0,-1) : '0';
    updateDisplay();
  }
});

/* ── Инициализация ── */
const savedTheme = localStorage.getItem('calcTheme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
renderHistory();
