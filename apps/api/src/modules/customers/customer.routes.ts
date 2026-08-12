import { Router, type IRouter } from "express";
import { list, get, create, update, remove } from "./customer.controller";
import { authenticate, requireRole, validateBody } from "../../middleware";
import { createCustomerSchema, updateCustomerSchema } from "./customer.validation";

const router: IRouter = Router();

router.get("/customers", authenticate, list);
router.get("/customers/:id", authenticate, get);
router.post("/customers", authenticate, requireRole("OWNER"), validateBody(createCustomerSchema), create);
router.patch("/customers/:id", authenticate, requireRole("OWNER"), validateBody(updateCustomerSchema), update);
router.delete("/customers/:id", authenticate, requireRole("OWNER"), remove);

export default router;
