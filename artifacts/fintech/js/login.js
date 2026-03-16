const form     = document.getElementById('loginForm');
const errorEl  = document.getElementById('errorMsg');
const loginBtn = document.getElementById('loginBtn');

function showError(msg) { errorEl.textContent = msg; errorEl.classList.add('show'); }
function clearError()   { errorEl.classList.remove('show'); }

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();
  loginBtn.textContent = 'Signing in...';
  loginBtn.disabled = true;

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { showError(data.error || 'Login failed'); }
    else { window.location.href = '/dashboard'; }
  } catch { showError('Network error. Please try again.'); }
  finally { loginBtn.textContent = 'Sign In'; loginBtn.disabled = false; }
});
