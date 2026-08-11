import { Router, type IRouter } from "express";
import healthRouter from "../modules/health/health.routes";
import authRouter from "../modules/auth/auth.routes";
import organizationsRouter from "../modules/organizations/organization.routes";
import usersRouter from "../modules/users/user.routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use(organizationsRouter);
router.use(usersRouter);

export default router;
