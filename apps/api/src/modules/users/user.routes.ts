import { Router, type IRouter } from "express";
import { list, get, create, update, remove } from "./user.controller";
import { authenticate, requireRole, validateBody } from "../../middleware";
import { createUserSchema, updateUserSchema } from "./user.validation";

const router: IRouter = Router();

router.get("/users", authenticate, list);
router.get("/users/:id", authenticate, get);
router.post(
  "/users",
  authenticate,
  requireRole("OWNER"),
  validateBody(createUserSchema),
  create,
);
router.patch(
  "/users/:id",
  authenticate,
  requireRole("OWNER"),
  validateBody(updateUserSchema),
  update,
);
router.delete("/users/:id", authenticate, requireRole("OWNER"), remove);

export default router;
