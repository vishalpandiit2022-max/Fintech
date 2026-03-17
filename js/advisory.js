// ─── Auth ─────────────────────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem('ft_user') || 'null');
if (!user) { window.location.href = 'index.html'; }

// ─── Active nav ───────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(a => {
  if (a.getAttribute('href') === 'advisory.html') a.classList.add('active');
});

document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
function doLogout() { window.location.href = 'index.html'; }

// ─── Tips per category ────────────────────────────────────────────────────
const TIPS = {
  Food:          { icon:'🍽️', tip:'Food expenses are significant. Meal prepping and cooking at home can reduce costs by 30–40%.' },
  Transport:     { icon:'🚗', tip:'Transport costs are notable. Explore public transit, carpooling, or cycling for short trips.' },
  Shopping:      { icon:'🛍️', tip:'Shopping is high. Try the 30-day rule — wait before making any non-essential purchase.' },
  Bills:         { icon:'📋', tip:'Review subscriptions monthly. Cancel unused ones and negotiate better rates with providers.' },
  Entertainment: { icon:'🎮', tip:'Entertainment spend is noticeable. Look for free local events and library memberships.' },
  Other:         { icon:'📦', tip:'Track miscellaneous items more closely — uncategorised spending hides potential savings.' }
};

const CHAT_RESPONSES = [
  "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings. It's a proven starting framework.",
  "Build a 3–6 month emergency fund before investing aggressively. That's your financial safety net.",
  "SIPs (Systematic Investment Plans) in index mutual funds are one of the best long-term wealth strategies in India.",
  "High-interest debt (credit cards, personal loans) should always be cleared before investing.",
  "Automate savings on payday — set up an automatic transfer so you save before you spend.",
  "PPF (Public Provident Fund) offers tax-free returns and is a great long-term safe investment.",
  "Review your expenses quarterly. Small recurring charges add up significantly over a year.",
  "Diversify across equity, debt, and gold to balance risk and returns across market cycles.",
  "ELSS mutual funds offer tax deductions under Section 80C with the shortest lock-in (3 years).",
  "Keep your EMI obligations below 40% of your monthly income to avoid financial stress.",
  "NPS (National Pension System) is excellent for retirement planning with additional tax benefits.",
  "Track your net worth monthly — it's the single most motivating metric for financial progress."
];

let chatIdx = 0;

// ─── Analysis ─────────────────────────────────────────────────────────────
function analyzeSpending() {
  const btn      = document.getElementById('analyzeBtn');
  const expenses = JSON.parse(localStorage.getItem('ft_expenses') || '[]');
  const results  = document.getElementById('analysisResults');
  const list     = document.getElementById('insightsList');

  btn.textContent = '⏳ Analyzing...'; btn.disabled = true;

  setTimeout(() => {
    if (expenses.length === 0) {
      list.innerHTML = '<div class="analysis-item"><div class="icon">ℹ️</div><div class="text"><p>No expenses found. Add some expenses first to get personalised insights.</p></div></div>';
      results.classList.add('visible');
      btn.textContent = '🔍 Analyze My Spending'; btn.disabled = false;
      return;
    }

    const catTotals = {};
    expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    const total   = expenses.reduce((s, e) => s + e.amount, 0);
    const topCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const fmt     = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    const savingsRate = user.salary > 0 ? ((user.salary - total) / user.salary * 100).toFixed(1) : 0;

    list.innerHTML = topCats.map(([cat, amt]) => {
      const pct = ((amt / total) * 100).toFixed(0);
      const tip = TIPS[cat] || TIPS.Other;
      return `<div class="analysis-item">
        <div class="icon">${tip.icon}</div>
        <div class="text"><p><strong>${cat}:</strong> ${fmt(amt)} (${pct}% of spending). ${tip.tip}</p></div>
      </div>`;
    }).join('') + `<div class="analysis-item">
      <div class="icon">📈</div>
      <div class="text">
        <p><strong>Overall:</strong> Total spending is ${fmt(total)}. 
        ${user.salary > 0 ? `Your current savings rate is <strong>${savingsRate}%</strong>. ${parseFloat(savingsRate) >= 20 ? '✅ Great job!' : '⚠️ Aim for at least 20%.'}` : ''}
        Focus on reducing the top spending category first.</p>
      </div>
    </div>`;

    results.classList.add('visible');
    btn.textContent = '🔄 Re-Analyze'; btn.disabled = false;
  }, 800);
}

// ─── Chat ─────────────────────────────────────────────────────────────────
function sendChat() {
  const input = document.getElementById('chatInput');
  const msgs  = document.getElementById('chatMessages');
  const text  = input.value.trim();
  if (!text) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.textContent = text;
  msgs.appendChild(userMsg);
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-msg bot';
    botMsg.textContent = CHAT_RESPONSES[chatIdx++ % CHAT_RESPONSES.length];
    msgs.appendChild(botMsg);
    msgs.scrollTop = msgs.scrollHeight;
  }, 700);
}

document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendChat();
});
