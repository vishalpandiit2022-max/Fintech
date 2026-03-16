import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import expensesRouter from "./expenses";
import savingsGoalsRouter from "./savings-goals";
import userRouter from "./user";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/expenses", expensesRouter);
router.use("/savings-goals", savingsGoalsRouter);
router.use("/user", userRouter);

export default router;
