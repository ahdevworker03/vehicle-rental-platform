import { Router, type IRouter } from "express";
import {
  list,
  listByRental,
  create,
} from "./payment.controller";
import {
  authenticate,
  requireRole,
  validateBody,
} from "../../middleware";
import { createPaymentSchema } from "./payment.validation";

const router: IRouter = Router();

router.get("/payments", authenticate, list);
router.get("/rentals/:rentalId/payments", authenticate, listByRental);
router.post(
  "/rentals/:rentalId/payments",
  authenticate,
  requireRole("OWNER"),
  validateBody(createPaymentSchema),
  create,
);

export default router;
