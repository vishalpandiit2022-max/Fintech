// ─── Auth ─────────────────────────────────────────────────────────────────
let user = JSON.parse(localStorage.getItem('ft_user') || 'null');
if (!user) { window.location.href = 'index.html'; }

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

// ─── Active nav ───────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(a => {
  if (a.getAttribute('href') === 'profile.html') a.classList.add('active');
});

function doLogout() { window.location.href = 'index.html'; }

// ─── Load profile ─────────────────────────────────────────────────────────
function loadProfile() {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('userAvatar').textContent  = initials;
  document.getElementById('profileAvatar').textContent = initials;
  document.getElementById('profileName').textContent  = user.name;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('infoName').textContent     = user.name;
  document.getElementById('infoEmail').textContent    = user.email;
  document.getElementById('infoSalary').textContent   = fmt(user.salary);
  document.getElementById('newSalary').value          = user.salary;
}

// ─── Update salary ────────────────────────────────────────────────────────
document.getElementById('salaryForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const errEl = document.getElementById('salaryError');
  const sucEl = document.getElementById('salarySuccess');
  errEl.classList.remove('show');
  sucEl.classList.remove('show');

  const newSalary = parseFloat(document.getElementById('newSalary').value);
  if (isNaN(newSalary) || newSalary < 0) {
    errEl.textContent = 'Please enter a valid salary amount.';
    errEl.classList.add('show');
    return;
  }

  user.salary = newSalary;
  localStorage.setItem('ft_user', JSON.stringify(user));
  document.getElementById('infoSalary').textContent = fmt(newSalary);
  sucEl.textContent = 'Salary updated successfully!';
  sucEl.classList.add('show');
  setTimeout(() => sucEl.classList.remove('show'), 3000);
});

// ─── Clear all data ───────────────────────────────────────────────────────
function clearAllData() {
  if (confirm('This will permanently delete ALL your data. Are you sure?')) {
    localStorage.clear();
    window.location.href = 'index.html';
  }
}

loadProfile();
