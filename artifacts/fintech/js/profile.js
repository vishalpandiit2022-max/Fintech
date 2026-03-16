const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

async function loadProfile() {
  const res = await fetch('/user', { headers: { 'Accept': 'application/json' } });
  if (!res.ok) { window.location.href = '/login'; return; }
  const user = await res.json();

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('profileAvatar').textContent = initials;
  document.getElementById('profileName').textContent   = user.name;
  document.getElementById('profileEmail').textContent  = user.email;
  document.getElementById('infoName').textContent      = user.name;
  document.getElementById('infoEmail').textContent     = user.email;
  document.getElementById('infoSalary').textContent    = fmt(user.salary);
  document.getElementById('newSalary').value           = user.salary;
}

document.getElementById('salaryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('salaryError');
  const sucEl = document.getElementById('salarySuccess');
  errEl.classList.remove('show'); sucEl.classList.remove('show');

  try {
    const res = await fetch('/salary', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salary: parseFloat(document.getElementById('newSalary').value) })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Failed'; errEl.classList.add('show'); }
    else {
      sucEl.textContent = 'Salary updated successfully!';
      sucEl.classList.add('show');
      document.getElementById('infoSalary').textContent = fmt(data.salary);
      setTimeout(() => sucEl.classList.remove('show'), 3000);
    }
  } catch { errEl.textContent = 'Network error.'; errEl.classList.add('show'); }
});

loadProfile();
