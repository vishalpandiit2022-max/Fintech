# FinTech Personal Finance Dashboard

## Overview

Full-stack FinTech personal finance dashboard with authentication, expense tracking, savings goals, investment advisory, and profile management.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/fintech)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: express-session + bcryptjs (cookie-based sessions)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion, Recharts

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080 → /api)
│   └── fintech/            # React + Vite frontend (port 24328 → /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
```

## Features

1. **Authentication** - Login/Signup with bcrypt-hashed passwords, cookie sessions
2. **Dashboard** - Financial overview: salary, expenses, savings, savings rate %
3. **Expense Tracker** - Add/delete expenses by category with ₹ amounts
4. **Savings Goals** - Create goals with slider for months, monthly savings calculator
5. **Investment Advisory** - AI-style analysis with canned financial tips
6. **Profile** - View/update user info and monthly salary

## Database Tables

- `users` — id, name, email, password, monthly_salary
- `expenses` — id, user_id, description, category, amount, date
- `savings_goals` — id, user_id, goal_name, target_amount, months
- `session` — Express session storage (auto-created by connect-pg-simple)

## API Endpoints

- `POST /api/auth/signup` — Create account
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user
- `GET /api/expenses` — List user expenses
- `POST /api/expenses` — Create expense
- `DELETE /api/expenses/:id` — Delete expense
- `GET /api/savings-goals` — List savings goals
- `POST /api/savings-goals` — Create savings goal
- `DELETE /api/savings-goals/:id` — Delete savings goal
- `PUT /api/user/salary` — Update monthly salary

## Development

```bash
# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/fintech run dev

# Run codegen after OpenAPI spec changes
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes
pnpm --filter @workspace/db run push
```
