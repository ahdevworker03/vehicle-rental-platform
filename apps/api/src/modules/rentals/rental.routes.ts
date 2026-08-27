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
import {
  authenticate,
  requireRole,
  requireOperationalOrganization,
  validateBody,
  validateQuery,
} from "../../middleware";
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
router.use(authenticate, requireOperationalOrganization);

router.get(
  "/rentals",
  validateQuery(listRentalsQuerySchema),
  list,
);
router.get(
  "/rentals/availability",
  validateQuery(checkAvailabilityQuerySchema),
  availability,
);
router.get("/rentals/:id", get);
router.post(
  "/rentals",
  requireRole("OWNER"),
  validateBody(createRentalSchema),
  create,
);
router.patch(
  "/rentals/:id",
  requireRole("OWNER"),
  validateBody(updateRentalSchema),
  update,
);
router.post(
  "/rentals/:id/pickup",
  requireRole("OWNER"),
  validateBody(pickupRentalSchema),
  pickup,
);
router.post(
  "/rentals/:id/return",
  requireRole("OWNER"),
  validateBody(returnRentalSchema),
  ret,
);
router.post(
  "/rentals/:id/extend",
  requireRole("OWNER"),
  validateBody(extendRentalSchema),
  extend,
);
router.post("/rentals/:id/cancel", requireRole("OWNER"), cancel);
router.delete("/rentals/:id", requireRole("OWNER"), remove);

export default router;
