// ─── Auth ─────────────────────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem('ft_user') || 'null');
if (!user) { window.location.href = 'index.html'; }

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const CAT_ICONS = { Food:'🍽️', Transport:'🚗', Shopping:'🛍️', Bills:'📋', Entertainment:'🎮', Other:'📦' };
const CAT_CSS   = { Food:'cat-food', Transport:'cat-transport', Shopping:'cat-shopping', Bills:'cat-bills', Entertainment:'cat-entertainment', Other:'cat-other' };

// ─── Active nav ───────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(a => {
  if (a.getAttribute('href') === 'dashboard.html') a.classList.add('active');
});

function doLogout() {
  window.location.href = 'index.html';
}

// ─── Load dashboard ───────────────────────────────────────────────────────
function loadDashboard() {
  const expenses = JSON.parse(localStorage.getItem('ft_expenses') || '[]');
  const total    = expenses.reduce((s, e) => s + e.amount, 0);
  const savings  = user.salary - total;
  const rate     = user.salary > 0 ? (savings / user.salary) * 100 : 0;

  document.getElementById('userAvatar').textContent   = user.name.charAt(0).toUpperCase();
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

// ─── Modal ────────────────────────────────────────────────────────────────
function openModal() {
  document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('expenseModal').classList.add('open');
}

function closeModal() {
  document.getElementById('expenseModal').classList.remove('open');
  document.getElementById('addExpenseForm').reset();
  document.getElementById('modalError').classList.remove('show');
}

document.getElementById('addExpenseForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn   = document.getElementById('addBtn');
  const errEl = document.getElementById('modalError');
  const desc  = document.getElementById('expDesc').value.trim();
  const cat   = document.getElementById('expCat').value;
  const amt   = parseFloat(document.getElementById('expAmount').value);
  const date  = document.getElementById('expDate').value;

  if (!desc || !cat || !amt || !date) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.classList.add('show');
    return;
  }

  btn.textContent = 'Adding...'; btn.disabled = true;

  const expenses = JSON.parse(localStorage.getItem('ft_expenses') || '[]');
  expenses.unshift({ id: Date.now(), description: desc, category: cat, amount: amt, date });
  localStorage.setItem('ft_expenses', JSON.stringify(expenses));

  closeModal();
  loadDashboard();
  btn.textContent = 'Add Expense'; btn.disabled = false;
});

document.getElementById('expenseModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

loadDashboard();
