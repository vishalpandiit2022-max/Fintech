// ─── Auth ─────────────────────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem('ft_user') || 'null');
if (!user) { window.location.href = 'index.html'; }

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

// ─── Active nav ───────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(a => {
  if (a.getAttribute('href') === 'savings.html') a.classList.add('active');
});

document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
function doLogout() { window.location.href = 'index.html'; }

// ─── Slider preview ───────────────────────────────────────────────────────
const monthsSlider  = document.getElementById('months');
const monthsLabel   = document.getElementById('monthsLabel');
const targetInput   = document.getElementById('targetAmount');
const previewEl     = document.getElementById('monthlyPreview');
const monthlyAmtEl  = document.getElementById('monthlyAmount');

function updatePreview() {
  const target = parseFloat(targetInput.value) || 0;
  const months = parseInt(monthsSlider.value) || 1;
  monthsLabel.textContent = months + (months === 1 ? ' month' : ' months');
  if (target > 0) {
    monthlyAmtEl.textContent = fmt(target / months);
    previewEl.classList.add('visible');
  } else {
    previewEl.classList.remove('visible');
  }
}

monthsSlider.addEventListener('input', updatePreview);
targetInput.addEventListener('input', updatePreview);

// ─── Data ─────────────────────────────────────────────────────────────────
function getGoals() { return JSON.parse(localStorage.getItem('ft_goals') || '[]'); }
function saveGoals(arr) { localStorage.setItem('ft_goals', JSON.stringify(arr)); }

function renderGoals() {
  const goals = getGoals();
  const el    = document.getElementById('goalsList');

  if (goals.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="icon">🎯</div><p>No goals yet. Create your first savings goal!</p></div>';
    return;
  }

  el.innerHTML = goals.map(g => `
    <div class="goal-card" id="goal-${g.id}">
      <div class="goal-name">${g.goal_name}</div>
      <div class="goal-amount">${fmt(g.target_amount)}</div>
      <div class="goal-meta">Over ${g.months} month${g.months > 1 ? 's' : ''}</div>
      <div class="goal-monthly">
        Monthly saving required: <span>${fmt(g.target_amount / g.months)}</span>
      </div>
      <div class="goal-footer">
        <button class="btn btn-danger" onclick="deleteGoal(${g.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function deleteGoal(id) {
  if (!confirm('Delete this goal?')) return;
  saveGoals(getGoals().filter(g => g.id !== id));
  renderGoals();
}

document.getElementById('goalForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const errEl = document.getElementById('formError');
  errEl.classList.remove('show');

  const name   = document.getElementById('goalName').value.trim();
  const target = parseFloat(targetInput.value);
  const months = parseInt(monthsSlider.value);

  if (!name || !target || !months) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.classList.add('show');
    return;
  }

  const goals = getGoals();
  goals.push({ id: Date.now(), goal_name: name, target_amount: target, months });
  saveGoals(goals);
  renderGoals();

  this.reset();
  monthsSlider.value = 12;
  previewEl.classList.remove('visible');
  updatePreview();
});

updatePreview();
renderGoals();
