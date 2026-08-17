import { Router, type IRouter } from "express";
import healthRouter from "../modules/health/health.routes";
import authRouter from "../modules/auth/auth.routes";
import organizationsRouter from "../modules/organizations/organization.routes";
import usersRouter from "../modules/users/user.routes";
import customersRouter from "../modules/customers/customer.routes";
import vehiclesRouter from "../modules/vehicles/vehicle.routes";
import rentalsRouter from "../modules/rentals/rental.routes";
import contractsRouter from "../modules/contracts/contract.routes";
import maintenanceRouter from "../modules/maintenance/maintenance.routes";
import expensesRouter from "../modules/expenses/expense.routes";
import paymentsRouter from "../modules/payments/payment.routes";
import tasksRouter from "../modules/tasks/task.routes";
import mediaRouter from "../modules/media/media.routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use(organizationsRouter);
router.use(usersRouter);
router.use(customersRouter);
router.use(vehiclesRouter);
router.use(rentalsRouter);
router.use(contractsRouter);
router.use(maintenanceRouter);
router.use(expensesRouter);
router.use(paymentsRouter);
router.use(tasksRouter);
router.use(mediaRouter);

export default router;
