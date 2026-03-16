const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const CAT_ICONS = { Food:'🍽️', Transport:'🚗', Shopping:'🛍️', Bills:'📋', Entertainment:'🎮', Other:'📦' };
const CAT_CSS   = { Food:'cat-food', Transport:'cat-transport', Shopping:'cat-shopping', Bills:'cat-bills', Entertainment:'cat-entertainment', Other:'cat-other' };

async function loadDashboard() {
  const [userRes, expRes] = await Promise.all([
    fetch('/user', { headers: { 'Accept': 'application/json' } }),
    fetch('/expenses-list', { headers: { 'Accept': 'application/json' } })
  ]);

  if (!userRes.ok) { window.location.href = '/login'; return; }

  const user     = await userRes.json();
  const expenses = expRes.ok ? await expRes.json() : [];

  const total   = expenses.reduce((s, e) => s + e.amount, 0);
  const savings = user.salary - total;
  const rate    = user.salary > 0 ? (savings / user.salary) * 100 : 0;

  document.getElementById('statSalary').textContent   = fmt(user.salary);
  document.getElementById('statExpenses').textContent = fmt(total);
  document.getElementById('statSavings').textContent  = fmt(savings);
  document.getElementById('statRate').textContent     = rate.toFixed(1) + '%';

  const el     = document.getElementById('recentExpenses');
  const recent = expenses.slice(0, 5);

  if (recent.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="icon">💳</div><p>No expenses yet. Add your first one!</p></div>';
    return;
  }

  el.innerHTML = recent.map(e => `
    <div class="expense-item">
      <div class="expense-cat-icon ${CAT_CSS[e.category] || 'cat-other'}">${CAT_ICONS[e.category] || '📦'}</div>
      <div class="expense-info">
        <div class="expense-desc">${e.description}</div>
        <div class="expense-meta">${e.category} · ${e.date}</div>
      </div>
      <div class="expense-amount">−${fmt(e.amount)}</div>
    </div>
  `).join('');
}

function openModal() {
  document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('expenseModal').classList.add('open');
}
function closeModal() {
  document.getElementById('expenseModal').classList.remove('open');
  document.getElementById('addExpenseForm').reset();
  document.getElementById('modalError').classList.remove('show');
}

document.getElementById('addExpenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn   = document.getElementById('addBtn');
  const errEl = document.getElementById('modalError');
  btn.textContent = 'Adding...'; btn.disabled = true;

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
    else { closeModal(); loadDashboard(); }
  } catch { errEl.textContent = 'Network error.'; errEl.classList.add('show'); }
  finally { btn.textContent = 'Add Expense'; btn.disabled = false; }
});

document.getElementById('expenseModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

loadDashboard();
