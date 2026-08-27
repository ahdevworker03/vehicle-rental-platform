import { Router, type IRouter } from "express";
import { list, get, create, update, remove } from "./user.controller";
import {
  authenticate,
  requireOperationalOrganization,
  requireRole,
  validateBody,
} from "../../middleware";
import { createUserSchema, updateUserSchema } from "./user.validation";

const router: IRouter = Router();
router.use(authenticate, requireOperationalOrganization);

router.get("/users", list);
router.get("/users/:id", get);
router.post(
  "/users",
  requireRole("OWNER"),
  validateBody(createUserSchema),
  create,
);
router.patch(
  "/users/:id",
  requireRole("OWNER"),
  validateBody(updateUserSchema),
  update,
);
router.delete("/users/:id", requireRole("OWNER"), remove);

export default router;
