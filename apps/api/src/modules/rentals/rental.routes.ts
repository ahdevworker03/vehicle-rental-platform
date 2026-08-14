import { Router, type IRouter } from "express";
import {
  list,
  get,
  create,
  update,
  pickup,
  ret,
  extend,
  cancel,
  remove,
  availability,
} from "./rental.controller";
import { authenticate, requireRole, validateBody, validateQuery } from "../../middleware";
import {
  createRentalSchema,
  updateRentalSchema,
  listRentalsQuerySchema,
  pickupRentalSchema,
  returnRentalSchema,
  extendRentalSchema,
  checkAvailabilityQuerySchema,
} from "./rental.validation";

const router: IRouter = Router();

router.get("/rentals", authenticate, validateQuery(listRentalsQuerySchema), list);
router.get("/rentals/availability", authenticate, validateQuery(checkAvailabilityQuerySchema), availability);
router.get("/rentals/:id", authenticate, get);
router.post("/rentals", authenticate, requireRole("OWNER"), validateBody(createRentalSchema), create);
router.patch("/rentals/:id", authenticate, requireRole("OWNER"), validateBody(updateRentalSchema), update);
router.post("/rentals/:id/pickup", authenticate, requireRole("OWNER"), validateBody(pickupRentalSchema), pickup);
router.post("/rentals/:id/return", authenticate, requireRole("OWNER"), validateBody(returnRentalSchema), ret);
router.post("/rentals/:id/extend", authenticate, requireRole("OWNER"), validateBody(extendRentalSchema), extend);
router.post("/rentals/:id/cancel", authenticate, requireRole("OWNER"), cancel);
router.delete("/rentals/:id", authenticate, requireRole("OWNER"), remove);

export default router;
