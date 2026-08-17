import { Router, type IRouter } from "express";
import {
  list,
  get,
  create,
  update,
  complete,
  remove,
} from "./task.controller";
import {
  authenticate,
  requireRole,
  validateBody,
} from "../../middleware";
import {
  createTaskSchema,
  updateTaskSchema,
} from "./task.validation";

const router: IRouter = Router();

router.get("/tasks", authenticate, list);
router.get("/tasks/:id", authenticate, get);
router.post(
  "/tasks",
  authenticate,
  requireRole("OWNER"),
  validateBody(createTaskSchema),
  create,
);
router.patch(
  "/tasks/:id",
  authenticate,
  requireRole("OWNER"),
  validateBody(updateTaskSchema),
  update,
);
router.post(
  "/tasks/:id/complete",
  authenticate,
  requireRole("OWNER"),
  complete,
);
router.delete("/tasks/:id", authenticate, requireRole("OWNER"), remove);

export default router;
