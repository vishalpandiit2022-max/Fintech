import os
import sqlite3
import hashlib
import secrets
from flask import Flask, send_from_directory, request, jsonify, session, redirect

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "database.db")

app = Flask(__name__, static_folder=ROOT, static_url_path="")
app.secret_key = os.environ.get("SECRET_KEY", "fintech-super-secret-2024")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            salary REAL NOT NULL DEFAULT 0
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS savings_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            goal_name TEXT NOT NULL,
            target_amount REAL NOT NULL,
            months INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    conn.commit()
    conn.close()


def hash_password(password):
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{hashed}"


def verify_password(stored, provided):
    parts = stored.split(":")
    if len(parts) != 2:
        return False
    salt, hashed = parts
    return hashlib.sha256((salt + provided).encode()).hexdigest() == hashed


# ─── Page routes ─────────────────────────────────────────────────────────────

@app.route("/")
def index():
    if "user_id" in session:
        return redirect("/dashboard")
    return redirect("/login")


@app.route("/login")
def login_page():
    if "user_id" in session:
        return redirect("/dashboard")
    return send_from_directory(ROOT, "login.html")


@app.route("/signup")
def signup_page():
    if "user_id" in session:
        return redirect("/dashboard")
    return send_from_directory(ROOT, "signup.html")


@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect("/login")
    return send_from_directory(ROOT, "dashboard.html")


@app.route("/expenses")
def expenses_page():
    if "user_id" not in session:
        return redirect("/login")
    return send_from_directory(ROOT, "expenses.html")


@app.route("/savings")
def savings_page():
    if "user_id" not in session:
        return redirect("/login")
    return send_from_directory(ROOT, "savings.html")


@app.route("/advisory")
def advisory_page():
    if "user_id" not in session:
        return redirect("/login")
    return send_from_directory(ROOT, "advisory.html")


@app.route("/profile")
def profile_page():
    if "user_id" not in session:
        return redirect("/login")
    return send_from_directory(ROOT, "profile.html")


# ─── Auth API ─────────────────────────────────────────────────────────────────

@app.route("/signup", methods=["POST"])
def api_signup():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    salary = data.get("salary", 0)

    if not all([name, email, password]):
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db()
    try:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            return jsonify({"error": "Email already registered"}), 409

        hashed = hash_password(password)
        cursor = conn.execute(
            "INSERT INTO users (name, email, password, salary) VALUES (?, ?, ?, ?)",
            (name, email, hashed, float(salary))
        )
        conn.commit()
        user_id = cursor.lastrowid
        session["user_id"] = user_id
        session["user_name"] = name
        return jsonify({
            "message": "Account created",
            "user": {"id": user_id, "name": name, "email": email, "salary": float(salary)}
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@app.route("/login", methods=["POST"])
def api_login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    conn = get_db()
    try:
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if not user or not verify_password(user["password"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        session["user_id"] = user["id"]
        session["user_name"] = user["name"]
        return jsonify({
            "message": "Login successful",
            "user": {"id": user["id"], "name": user["name"], "email": user["email"], "salary": user["salary"]}
        })
    finally:
        conn.close()


@app.route("/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify({"message": "Logged out"})


@app.route("/user", methods=["GET"])
def api_get_user():
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    conn = get_db()
    try:
        user = conn.execute(
            "SELECT id, name, email, salary FROM users WHERE id = ?",
            (session["user_id"],)
        ).fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"id": user["id"], "name": user["name"], "email": user["email"], "salary": user["salary"]})
    finally:
        conn.close()


@app.route("/salary", methods=["PUT"])
def api_update_salary():
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json()
    salary = data.get("salary")
    if salary is None:
        return jsonify({"error": "salary is required"}), 400
    conn = get_db()
    try:
        conn.execute("UPDATE users SET salary = ? WHERE id = ?", (float(salary), session["user_id"]))
        conn.commit()
        return jsonify({"message": "Salary updated", "salary": float(salary)})
    finally:
        conn.close()


# ─── Expenses API ─────────────────────────────────────────────────────────────

@app.route("/expenses-list", methods=["GET"])
def api_get_expenses():
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC",
            (session["user_id"],)
        ).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()


@app.route("/expenses-list", methods=["POST"])
def api_create_expense():
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json()
    description = data.get("description", "").strip()
    category = data.get("category", "").strip()
    amount = data.get("amount")
    date = data.get("date", "").strip()

    if not all([description, category, amount, date]):
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db()
    try:
        cursor = conn.execute(
            "INSERT INTO expenses (user_id, description, category, amount, date) VALUES (?, ?, ?, ?, ?)",
            (session["user_id"], description, category, float(amount), date)
        )
        conn.commit()
        return jsonify({
            "id": cursor.lastrowid, "user_id": session["user_id"],
            "description": description, "category": category,
            "amount": float(amount), "date": date
        }), 201
    finally:
        conn.close()


@app.route("/expenses-list/<int:expense_id>", methods=["DELETE"])
def api_delete_expense(expense_id):
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id FROM expenses WHERE id = ? AND user_id = ?",
            (expense_id, session["user_id"])
        ).fetchone()
        if not row:
            return jsonify({"error": "Expense not found"}), 404
        conn.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
        conn.commit()
        return jsonify({"message": "Expense deleted"})
    finally:
        conn.close()


# ─── Savings Goals API ────────────────────────────────────────────────────────

@app.route("/savings-goals", methods=["GET"])
def api_get_savings_goals():
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM savings_goals WHERE user_id = ?",
            (session["user_id"],)
        ).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()


@app.route("/savings-goals", methods=["POST"])
def api_create_savings_goal():
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json()
    goal_name = data.get("goal_name", "").strip()
    target_amount = data.get("target_amount")
    months = data.get("months")

    if not all([goal_name, target_amount, months]):
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db()
    try:
        cursor = conn.execute(
            "INSERT INTO savings_goals (user_id, goal_name, target_amount, months) VALUES (?, ?, ?, ?)",
            (session["user_id"], goal_name, float(target_amount), int(months))
        )
        conn.commit()
        return jsonify({
            "id": cursor.lastrowid, "user_id": session["user_id"],
            "goal_name": goal_name, "target_amount": float(target_amount), "months": int(months)
        }), 201
    finally:
        conn.close()


@app.route("/savings-goals/<int:goal_id>", methods=["DELETE"])
def api_delete_savings_goal(goal_id):
    if "user_id" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id FROM savings_goals WHERE id = ? AND user_id = ?",
            (goal_id, session["user_id"])
        ).fetchone()
        if not row:
            return jsonify({"error": "Goal not found"}), 404
        conn.execute("DELETE FROM savings_goals WHERE id = ?", (goal_id,))
        conn.commit()
        return jsonify({"message": "Goal deleted"})
    finally:
        conn.close()


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
