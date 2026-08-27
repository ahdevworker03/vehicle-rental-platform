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
  requireOperationalOrganization,
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
router.use(authenticate, requireOperationalOrganization);

router.get(
  "/maintenance",
  validateQuery(listMaintenanceQuerySchema),
  list,
);
router.get("/maintenance/:id", get);
router.post(
  "/maintenance",
  requireRole("OWNER"),
  validateBody(createMaintenanceSchema),
  create,
);
router.patch(
  "/maintenance/:id",
  requireRole("OWNER"),
  validateBody(updateMaintenanceSchema),
  update,
);
router.post(
  "/maintenance/:id/complete",
  requireRole("OWNER"),
  validateBody(completeMaintenanceSchema),
  complete,
);
router.delete("/maintenance/:id", requireRole("OWNER"), remove);
router.get("/vehicles/:vehicleId/maintenance", listByVehicle);

export default router;
