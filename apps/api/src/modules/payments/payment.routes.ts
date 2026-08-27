import { Router, type IRouter } from "express";
import {
  list,
  listByRental,
  create,
} from "./payment.controller";
import {
  authenticate,
  requireRole,
  requireOperationalOrganization,
  validateBody,
} from "../../middleware";
import { createPaymentSchema } from "./payment.validation";

const router: IRouter = Router();
router.use(authenticate, requireOperationalOrganization);

router.get("/payments", list);
router.get("/rentals/:rentalId/payments", listByRental);
router.post(
  "/rentals/:rentalId/payments",
  requireRole("OWNER"),
  validateBody(createPaymentSchema),
  create,
);

export default router;
