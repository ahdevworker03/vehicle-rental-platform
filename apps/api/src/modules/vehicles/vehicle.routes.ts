import { Router, type IRouter } from "express";
import {
  list,
  get,
  create,
  update,
  remove,
  availability,
} from "./vehicle.controller";
import {
  authenticate,
  requireRole,
  requireOperationalOrganization,
  validateBody,
  validateQuery,
} from "../../middleware";
import {
  createVehicleSchema,
  updateVehicleSchema,
  listVehiclesQuerySchema,
  listAvailableVehiclesQuerySchema,
} from "./vehicle.validation";

const router: IRouter = Router();
router.use(authenticate, requireOperationalOrganization);

router.get(
  "/vehicles",
  validateQuery(listVehiclesQuerySchema),
  list,
);
router.get(
  "/vehicles/availability",
  validateQuery(listAvailableVehiclesQuerySchema),
  availability,
);
router.get("/vehicles/:id", get);
router.post(
  "/vehicles",
  requireRole("OWNER"),
  validateBody(createVehicleSchema),
  create,
);
router.patch(
  "/vehicles/:id",
  requireRole("OWNER"),
  validateBody(updateVehicleSchema),
  update,
);
router.delete("/vehicles/:id", requireRole("OWNER"), remove);

export default router;
