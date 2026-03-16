# FinTech Personal Finance Dashboard

## Overview

A full-stack FinTech personal finance dashboard built with Python Flask backend and vanilla HTML/CSS/JavaScript frontend. Uses SQLite for data storage.

## Technology Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Python (Flask)
- **Database**: SQLite
- **UI Theme**: Dark fintech dashboard design

## Project Structure

```
artifacts/fintech/
├── app.py                  # Flask backend (all API routes + page routes)
├── database.db             # SQLite database (auto-created on first run)
│
├── templates/              # Flask HTML templates (Jinja2)
│   ├── base.html           # Base layout with sidebar + topbar
│   ├── login.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── expenses.html
│   ├── savings.html
│   ├── advisory.html
│   └── profile.html
│
└── static/                 # Static assets
    ├── css/
    │   └── style.css       # All CSS (dark fintech theme)
    ├── js/
    │   ├── login.js
    │   ├── signup.js
    │   ├── dashboard.js
    │   ├── expenses.js
    │   ├── savings.js
    │   ├── advisory.js
    │   └── profile.js
    └── images/
        └── hero-bg.png
```

## Database Tables (SQLite)

- `users` — id, name, email, password, salary
- `expenses` — id, user_id, description, category, amount, date
- `savings_goals` — id, user_id, goal_name, target_amount, months

## API Routes (Flask)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/signup | Create new account |
| POST | /api/login | Login |
| POST | /api/logout | Logout |
| GET | /api/user | Get current user |
| PUT | /api/salary | Update monthly salary |
| GET | /api/expenses | List user expenses |
| POST | /api/expenses | Create expense |
| DELETE | /api/expenses/<id> | Delete expense |
| GET | /api/savings-goals | List savings goals |
| POST | /api/savings-goals | Create savings goal |
| DELETE | /api/savings-goals/<id> | Delete savings goal |

## Page Routes

| Route | Description |
|-------|-------------|
| / | Redirects to /dashboard or /login |
| /login | Login page |
| /signup | Signup page |
| /dashboard | Main financial overview |
| /expenses | Expense tracker |
| /savings | Savings goals |
| /advisory | Investment advisory |
| /profile | User profile |

## Features

1. **Authentication** — Signup/Login with password hashing (SHA-256 + salt), cookie sessions
2. **Dashboard** — Salary, total expenses, net savings, savings rate % cards + recent expenses
3. **Expense Tracker** — Add/delete expenses with category, amount, date
4. **Savings Goals** — Goal name, target amount, months slider, monthly saving required calculator
5. **Investment Advisory** — AI-style spending analysis + chat Q&A with financial tips
6. **Profile** — View user info, update monthly salary

## Running the App

The Flask app runs via the workflow:
```bash
python3 app.py
```

The app reads PORT from the environment variable (default: 5000). In Replit it uses PORT=24328.
