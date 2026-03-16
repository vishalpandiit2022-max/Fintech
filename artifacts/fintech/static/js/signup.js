const form      = document.getElementById('signupForm');
const errorEl   = document.getElementById('errorMsg');
const successEl = document.getElementById('successMsg');
const btn       = document.getElementById('signupBtn');

function showError(msg)   { errorEl.textContent = msg;   errorEl.classList.add('show');   successEl.classList.remove('show'); }
function showSuccess(msg) { successEl.textContent = msg; successEl.classList.add('show'); errorEl.classList.remove('show'); }

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  btn.textContent = 'Creating account...'; btn.disabled = true;

  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const salary   = parseFloat(document.getElementById('salary').value) || 0;

  if (password.length < 6) {
    showError('Password must be at least 6 characters.');
    btn.textContent = 'Create Account'; btn.disabled = false; return;
  }

  try {
    const res = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, salary })
    });
    const data = await res.json();
    if (!res.ok) { showError(data.error || 'Signup failed'); }
    else {
      showSuccess('Account created! Redirecting...');
      setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
    }
  } catch { showError('Network error. Please try again.'); }
  finally { btn.textContent = 'Create Account'; btn.disabled = false; }
});
