import { Router, type IRouter } from "express";
import { list, get, create, update, remove } from "./customer.controller";
import {
  authenticate,
  requireRole,
  requireOperationalOrganization,
  validateBody,
  validateQuery,
} from "../../middleware";
import {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomersQuerySchema,
} from "./customer.validation";

const router: IRouter = Router();
router.use(authenticate, requireOperationalOrganization);

router.get(
  "/customers",
  validateQuery(listCustomersQuerySchema),
  list,
);
router.get("/customers/:id", get);
router.post(
  "/customers",
  requireRole("OWNER"),
  validateBody(createCustomerSchema),
  create,
);
router.patch(
  "/customers/:id",
  requireRole("OWNER"),
  validateBody(updateCustomerSchema),
  update,
);
router.delete("/customers/:id", requireRole("OWNER"), remove);

export default router;
