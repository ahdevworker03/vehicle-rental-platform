import { Router, type IRouter } from "express";
import healthRouter from "../modules/health/health.routes";
import authRouter from "../modules/auth/auth.routes";
import organizationsRouter from "../modules/organizations/organization.routes";
import usersRouter from "../modules/users/user.routes";
import customersRouter from "../modules/customers/customer.routes";
import vehiclesRouter from "../modules/vehicles/vehicle.routes";
import mediaRouter from "../modules/media/media.routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use(organizationsRouter);
router.use(usersRouter);
router.use(customersRouter);
router.use(vehiclesRouter);
router.use(mediaRouter);

export default router;
