import { Router, type IRouter } from "express";
import {
  authenticate,
  requireOperationalOrganization,
  requireRole,
  validateBody,
  validateParams,
  validateQuery,
} from "../../middleware";
import { create, get, list, remove, update } from "./maintenance-schedule.controller";
import {
  createMaintenanceScheduleSchema,
  deleteMaintenanceScheduleParamsSchema,
  getMaintenanceScheduleParamsSchema,
  listMaintenanceSchedulesQuerySchema,
  updateMaintenanceScheduleParamsSchema,
  updateMaintenanceScheduleSchema,
} from "./maintenance-schedule.validation";

const router: IRouter = Router();
router.use(authenticate, requireOperationalOrganization);

router.get(
  "/maintenance-schedules",
  validateQuery(listMaintenanceSchedulesQuerySchema),
  list,
);
router.get(
  "/maintenance-schedules/:id",
  validateParams(getMaintenanceScheduleParamsSchema),
  get,
);
router.post(
  "/maintenance-schedules",
  requireRole("OWNER"),
  validateBody(createMaintenanceScheduleSchema),
  create,
);
router.patch(
  "/maintenance-schedules/:id",
  requireRole("OWNER"),
  validateParams(updateMaintenanceScheduleParamsSchema),
  validateBody(updateMaintenanceScheduleSchema),
  update,
);
router.delete(
  "/maintenance-schedules/:id",
  requireRole("OWNER"),
  validateParams(deleteMaintenanceScheduleParamsSchema),
  remove,
);

export default router;
