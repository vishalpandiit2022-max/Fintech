const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const TIPS = {
  Food:          { icon:'🍽️', tip:'Food expenses are significant. Consider meal prepping and cooking at home to cut costs by up to 40%.' },
  Transport:     { icon:'🚗', tip:'Transport costs are notable. Explore public transit, carpooling, or cycling for short distances.' },
  Shopping:      { icon:'🛍️', tip:'Shopping expenses are high. Try the 30-day rule — wait before making non-essential purchases.' },
  Bills:         { icon:'📋', tip:'Review your subscriptions monthly. Cancel unused ones and negotiate better rates with providers.' },
  Entertainment: { icon:'🎮', tip:'Entertainment spend is noticeable. Look for free local events and library memberships.' },
  Other:         { icon:'📦', tip:'Track miscellaneous expenses more closely. Uncategorized spending often hides potential savings.' }
};

const CHAT_RESPONSES = [
  "Based on your spending, I recommend allocating at least 20% of your income to savings each month (the 50/30/20 rule).",
  "Consider investing in index funds after building a 3-6 month emergency fund.",
  "High-interest debt should be paid off before investing aggressively.",
  "Automate your savings — set up an automatic transfer to a savings account on payday.",
  "Review your expenses quarterly. Small recurring charges add up significantly over time.",
  "For long-term wealth building, consider SIPs (Systematic Investment Plans) in mutual funds.",
  "Keep your fixed expenses below 50% of income for healthy financial flexibility.",
  "An emergency fund of 3-6 months of expenses is your most important financial safety net.",
  "Tax-saving instruments like ELSS funds, PPF, and NPS can reduce your tax burden while growing wealth.",
  "Diversify investments across equity, debt, and gold to balance risk and returns."
];

let chatIdx = 0;

async function analyzeSpending() {
  const btn = document.getElementById('analyzeBtn');
  btn.textContent = '⏳ Analyzing...'; btn.disabled = true;

  try {
    const res      = await fetch('/expenses-list', { headers: { 'Accept': 'application/json' } });
    const expenses = res.ok ? await res.json() : [];
    const results  = document.getElementById('analysisResults');
    const list     = document.getElementById('insightsList');

    if (expenses.length === 0) {
      list.innerHTML = '<div class="analysis-item"><div class="icon">ℹ️</div><div class="text"><p>No expenses found. Add some expenses first to get personalized insights.</p></div></div>';
      results.classList.add('visible');
      return;
    }

    const catTotals = {};
    expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    const total   = expenses.reduce((s, e) => s + e.amount, 0);
    const topCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    list.innerHTML = topCats.map(([cat, amt]) => {
      const pct = ((amt / total) * 100).toFixed(0);
      const tip = TIPS[cat] || TIPS.Other;
      return `<div class="analysis-item"><div class="icon">${tip.icon}</div><div class="text"><p><strong>${cat}:</strong> ${fmt(amt)} (${pct}% of spending). ${tip.tip}</p></div></div>`;
    }).join('') + `<div class="analysis-item"><div class="icon">💡</div><div class="text"><p><strong>Overall:</strong> Total spending is ${fmt(total)}. Focus on reducing the top expense category.</p></div></div>`;

    results.classList.add('visible');
  } catch { alert('Failed to analyze spending. Please try again.'); }
  finally { btn.textContent = '🔍 Analyze My Spending'; btn.disabled = false; }
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const msgs  = document.getElementById('chatMessages');
  const text  = input.value.trim();
  if (!text) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.textContent = text;
  msgs.appendChild(userMsg);

  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-msg bot';
    botMsg.textContent = CHAT_RESPONSES[chatIdx++ % CHAT_RESPONSES.length];
    msgs.appendChild(botMsg);
    msgs.scrollTop = msgs.scrollHeight;
  }, 600);

  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;
}

document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChat();
});
