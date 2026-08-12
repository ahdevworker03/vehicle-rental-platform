import { Router, type IRouter } from "express";
import { list, get, create, update, remove } from "./vehicle.controller";
import { authenticate, requireRole, validateBody } from "../../middleware";
import { createVehicleSchema, updateVehicleSchema } from "./vehicle.validation";

const router: IRouter = Router();

router.get("/vehicles", authenticate, list);
router.get("/vehicles/:id", authenticate, get);
router.post("/vehicles", authenticate, requireRole("OWNER"), validateBody(createVehicleSchema), create);
router.patch("/vehicles/:id", authenticate, requireRole("OWNER"), validateBody(updateVehicleSchema), update);
router.delete("/vehicles/:id", authenticate, requireRole("OWNER"), remove);

export default router;
