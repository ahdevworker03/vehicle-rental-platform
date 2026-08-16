import { Router, type IRouter } from "express";
import {
  list,
  get,
  create,
  update,
  complete,
  listByVehicle,
  remove,
} from "./maintenance.controller";
import {
  authenticate,
  requireRole,
  validateBody,
  validateQuery,
} from "../../middleware";
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  listMaintenanceQuerySchema,
  completeMaintenanceSchema,
} from "./maintenance.validation";

const router: IRouter = Router();

router.get(
  "/maintenance",
  authenticate,
  validateQuery(listMaintenanceQuerySchema),
  list,
);
router.get("/maintenance/:id", authenticate, get);
router.post(
  "/maintenance",
  authenticate,
  requireRole("OWNER"),
  validateBody(createMaintenanceSchema),
  create,
);
router.patch(
  "/maintenance/:id",
  authenticate,
  requireRole("OWNER"),
  validateBody(updateMaintenanceSchema),
  update,
);
router.post(
  "/maintenance/:id/complete",
  authenticate,
  requireRole("OWNER"),
  validateBody(completeMaintenanceSchema),
  complete,
);
router.delete("/maintenance/:id", authenticate, requireRole("OWNER"), remove);
router.get("/vehicles/:vehicleId/maintenance", authenticate, listByVehicle);

export default router;
