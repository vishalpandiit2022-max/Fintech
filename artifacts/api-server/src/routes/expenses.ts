import { Router, type IRouter, type Request, type Response } from "express";
import { db, expensesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

const requireAuth = (req: Request, res: Response, next: () => void) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
};

router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const expenses = await db
      .select()
      .from(expensesTable)
      .where(eq(expensesTable.userId, req.session.userId!));

    res.json(
      expenses.map((e) => ({
        ...e,
        amount: parseFloat(e.amount),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { description, category, amount, date } = req.body;
    if (!description || !category || amount === undefined || !date) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const [expense] = await db
      .insert(expensesTable)
      .values({
        userId: req.session.userId!,
        description,
        category,
        amount: String(amount),
        date,
      })
      .returning();

    res.status(201).json({
      ...expense,
      amount: parseFloat(expense.amount),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid expense ID" });
      return;
    }

    const deleted = await db
      .delete(expensesTable)
      .where(and(eq(expensesTable.id, id), eq(expensesTable.userId, req.session.userId!)))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Expense not found" });
      return;
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
