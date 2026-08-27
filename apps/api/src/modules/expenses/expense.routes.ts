import { Router, type IRouter } from "express";
import {
  list,
  get,
  create,
  update,
  remove,
} from "./expense.controller";
import {
  authenticate,
  requireRole,
  requireOperationalOrganization,
  validateBody,
  validateQuery,
} from "../../middleware";
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
} from "./expense.validation";

const router: IRouter = Router();
router.use(authenticate, requireOperationalOrganization);

router.get(
  "/expenses",
  validateQuery(listExpensesQuerySchema),
  list,
);
router.get("/expenses/:id", get);
router.post(
  "/expenses",
  requireRole("OWNER"),
  validateBody(createExpenseSchema),
  create,
);
router.patch(
  "/expenses/:id",
  requireRole("OWNER"),
  validateBody(updateExpenseSchema),
  update,
);
router.delete("/expenses/:id", requireRole("OWNER"), remove);

export default router;
