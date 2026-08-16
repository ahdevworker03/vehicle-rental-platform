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
  validateBody,
  validateQuery,
} from "../../middleware";
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
} from "./expense.validation";

const router: IRouter = Router();

router.get(
  "/expenses",
  authenticate,
  validateQuery(listExpensesQuerySchema),
  list,
);
router.get("/expenses/:id", authenticate, get);
router.post(
  "/expenses",
  authenticate,
  requireRole("OWNER"),
  validateBody(createExpenseSchema),
  create,
);
router.patch(
  "/expenses/:id",
  authenticate,
  requireRole("OWNER"),
  validateBody(updateExpenseSchema),
  update,
);
router.delete("/expenses/:id", authenticate, requireRole("OWNER"), remove);

export default router;
