import { Router, type IRouter, type Request, type Response } from "express";
import { db, savingsGoalsTable } from "@workspace/db";
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
    const goals = await db
      .select()
      .from(savingsGoalsTable)
      .where(eq(savingsGoalsTable.userId, req.session.userId!));

    res.json(
      goals.map((g) => ({
        ...g,
        targetAmount: parseFloat(g.targetAmount),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { goalName, targetAmount, months } = req.body;
    if (!goalName || targetAmount === undefined || months === undefined) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const [goal] = await db
      .insert(savingsGoalsTable)
      .values({
        userId: req.session.userId!,
        goalName,
        targetAmount: String(targetAmount),
        months: parseInt(months),
      })
      .returning();

    res.status(201).json({
      ...goal,
      targetAmount: parseFloat(goal.targetAmount),
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
      res.status(400).json({ error: "Invalid goal ID" });
      return;
    }

    const deleted = await db
      .delete(savingsGoalsTable)
      .where(and(eq(savingsGoalsTable.id, id), eq(savingsGoalsTable.userId, req.session.userId!)))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    res.json({ message: "Savings goal deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
