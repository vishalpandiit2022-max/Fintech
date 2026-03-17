// ─── Auth ─────────────────────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem('ft_user') || 'null');
if (!user) { window.location.href = 'index.html'; }

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const CAT_ICONS = { Food:'🍽️', Transport:'🚗', Shopping:'🛍️', Bills:'📋', Entertainment:'🎮', Other:'📦' };
const CAT_CSS   = { Food:'cat-food', Transport:'cat-transport', Shopping:'cat-shopping', Bills:'cat-bills', Entertainment:'cat-entertainment', Other:'cat-other' };

// ─── Active nav ───────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(a => {
  if (a.getAttribute('href') === 'expenses.html') a.classList.add('active');
});

document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();

function doLogout() { window.location.href = 'index.html'; }

// ─── State ────────────────────────────────────────────────────────────────
function getExpenses() { return JSON.parse(localStorage.getItem('ft_expenses') || '[]'); }
function saveExpenses(arr) { localStorage.setItem('ft_expenses', JSON.stringify(arr)); }

function toggleForm() {
  const card = document.getElementById('addFormCard');
  const isHidden = card.style.display === 'none' || card.style.display === '';
  card.style.display = isHidden ? 'block' : 'none';
  if (isHidden) document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
}

function renderExpenses() {
  const expenses = getExpenses();
  const el       = document.getElementById('expensesList');
  const total    = expenses.reduce((s, e) => s + e.amount, 0);
  document.getElementById('totalAmount').textContent = fmt(total);

  if (expenses.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="icon">💳</div><p>No expenses yet. Add your first one!</p></div>';
    return;
  }

  el.innerHTML = expenses.map(e => `
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

function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  const updated = getExpenses().filter(e => e.id !== id);
  saveExpenses(updated);
  renderExpenses();
}

document.getElementById('addExpenseForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const errEl = document.getElementById('formError');
  errEl.classList.remove('show');

  const desc  = document.getElementById('expDesc').value.trim();
  const cat   = document.getElementById('expCat').value;
  const amt   = parseFloat(document.getElementById('expAmount').value);
  const date  = document.getElementById('expDate').value;

  if (!desc || !cat || !amt || !date) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.classList.add('show');
    return;
  }

  const expenses = getExpenses();
  expenses.unshift({ id: Date.now(), description: desc, category: cat, amount: amt, date });
  saveExpenses(expenses);
  renderExpenses();
  this.reset();
  document.getElementById('addFormCard').style.display = 'none';
});

renderExpenses();
