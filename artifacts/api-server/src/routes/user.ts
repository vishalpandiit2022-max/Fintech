import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const requireAuth = (req: Request, res: Response, next: () => void) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
};

router.put("/salary", requireAuth, async (req: Request, res: Response) => {
  try {
    const { monthlySalary } = req.body;
    if (monthlySalary === undefined) {
      res.status(400).json({ error: "monthlySalary is required" });
      return;
    }

    const [user] = await db
      .update(usersTable)
      .set({ monthlySalary: String(monthlySalary) })
      .where(eq(usersTable.id, req.session.userId!))
      .returning();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      monthlySalary: parseFloat(user.monthlySalary),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
