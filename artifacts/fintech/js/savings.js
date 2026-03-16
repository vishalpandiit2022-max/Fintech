const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const monthsSlider = document.getElementById('months');
const monthsLabel  = document.getElementById('monthsLabel');
const targetInput  = document.getElementById('targetAmount');
const previewEl    = document.getElementById('monthlyPreview');
const monthlyAmtEl = document.getElementById('monthlyAmount');

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

async function loadGoals() {
  const res = await fetch('/savings-goals', { headers: { 'Accept': 'application/json' } });
  if (!res.ok) { window.location.href = '/login'; return; }
  renderGoals(await res.json());
}

function renderGoals(goals) {
  const el = document.getElementById('goalsList');
  if (goals.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="icon">🎯</div><p>No goals yet. Create your first savings goal!</p></div>';
    return;
  }
  el.innerHTML = goals.map(g => `
    <div class="goal-card" id="goal-${g.id}">
      <div class="goal-name">${g.goal_name}</div>
      <div class="goal-amount">${fmt(g.target_amount)}</div>
      <div class="goal-meta">Over ${g.months} month${g.months > 1 ? 's' : ''}</div>
      <div class="goal-monthly">Monthly saving required: <span>${fmt(g.target_amount / g.months)}</span></div>
      <div class="goal-footer">
        <button class="btn btn-danger btn-sm" onclick="deleteGoal(${g.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

async function deleteGoal(id) {
  if (!confirm('Delete this goal?')) return;
  const res = await fetch(`/savings-goals/${id}`, { method: 'DELETE' });
  if (res.ok) loadGoals();
}

document.getElementById('goalForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('formError');
  errEl.classList.remove('show');

  try {
    const res = await fetch('/savings-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal_name:     document.getElementById('goalName').value.trim(),
        target_amount: parseFloat(targetInput.value),
        months:        parseInt(monthsSlider.value)
      })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Failed'; errEl.classList.add('show'); }
    else {
      document.getElementById('goalForm').reset();
      monthsSlider.value = 12;
      previewEl.classList.remove('visible');
      updatePreview();
      loadGoals();
    }
  } catch { errEl.textContent = 'Network error.'; errEl.classList.add('show'); }
});

updatePreview();
loadGoals();
