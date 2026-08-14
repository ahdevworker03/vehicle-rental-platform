import { Router, type IRouter } from "express";
import { list, get, create, update, remove, availability } from "./vehicle.controller";
import { authenticate, requireRole, validateBody, validateQuery } from "../../middleware";
import {
  createVehicleSchema,
  updateVehicleSchema,
  listVehiclesQuerySchema,
  listAvailableVehiclesQuerySchema,
} from "./vehicle.validation";

const router: IRouter = Router();

router.get("/vehicles", authenticate, validateQuery(listVehiclesQuerySchema), list);
router.get("/vehicles/availability", authenticate, validateQuery(listAvailableVehiclesQuerySchema), availability);
router.get("/vehicles/:id", authenticate, get);
router.post("/vehicles", authenticate, requireRole("OWNER"), validateBody(createVehicleSchema), create);
router.patch("/vehicles/:id", authenticate, requireRole("OWNER"), validateBody(updateVehicleSchema), update);
router.delete("/vehicles/:id", authenticate, requireRole("OWNER"), remove);

export default router;
