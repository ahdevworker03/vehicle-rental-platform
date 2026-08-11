import { Router, type IRouter } from "express";
import healthRouter from "../modules/health/health.routes";
import authRouter from "../modules/auth/auth.routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);

export default router;
