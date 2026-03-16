const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const CAT_ICONS = { Food:'🍽️', Transport:'🚗', Shopping:'🛍️', Bills:'📋', Entertainment:'🎮', Other:'📦' };
const CAT_CSS   = { Food:'cat-food', Transport:'cat-transport', Shopping:'cat-shopping', Bills:'cat-bills', Entertainment:'cat-entertainment', Other:'cat-other' };

let allExpenses = [];

function toggleForm() {
  const card = document.getElementById('addFormCard');
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
  if (card.style.display === 'block') {
    document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
  }
}

async function loadExpenses() {
  const res = await fetch('/expenses-list', { headers: { 'Accept': 'application/json' } });
  if (!res.ok) { window.location.href = '/login'; return; }
  allExpenses = await res.json();
  renderExpenses();
}

function renderExpenses() {
  const el    = document.getElementById('expensesList');
  const total = allExpenses.reduce((s, e) => s + e.amount, 0);
  document.getElementById('totalAmount').textContent = fmt(total);

  if (allExpenses.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="icon">💳</div><p>No expenses yet.</p></div>';
    return;
  }

  el.innerHTML = allExpenses.map(e => `
    <div class="expense-item" id="exp-${e.id}">
      <div class="expense-cat-icon ${CAT_CSS[e.category] || 'cat-other'}">${CAT_ICONS[e.category] || '📦'}</div>
      <div class="expense-info">
        <div class="expense-desc">${e.description}</div>
        <div class="expense-meta">${e.category} · ${e.date}</div>
      </div>
      <div class="expense-amount">−${fmt(e.amount)}</div>
      <button class="btn btn-danger" onclick="deleteExpense(${e.id})">✕</button>
    </div>
  `).join('');
}

async function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  const res = await fetch(`/expenses-list/${id}`, { method: 'DELETE' });
  if (res.ok) { allExpenses = allExpenses.filter(e => e.id !== id); renderExpenses(); }
}

document.getElementById('addExpenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('formError');
  errEl.classList.remove('show');

  try {
    const res = await fetch('/expenses-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: document.getElementById('expDesc').value.trim(),
        category:    document.getElementById('expCat').value,
        amount:      parseFloat(document.getElementById('expAmount').value),
        date:        document.getElementById('expDate').value
      })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Failed'; errEl.classList.add('show'); }
    else {
      allExpenses.unshift(data);
      renderExpenses();
      document.getElementById('addExpenseForm').reset();
      document.getElementById('addFormCard').style.display = 'none';
    }
  } catch { errEl.textContent = 'Network error.'; errEl.classList.add('show'); }
});

loadExpenses();
