import { Router, type IRouter } from "express";
import { list, get, create, update, remove } from "./rental.controller";
import { authenticate, requireRole, validateBody, validateQuery } from "../../middleware";
import { createRentalSchema, updateRentalSchema, listRentalsQuerySchema } from "./rental.validation";

const router: IRouter = Router();

router.get("/rentals", authenticate, validateQuery(listRentalsQuerySchema), list);
router.get("/rentals/:id", authenticate, get);
router.post("/rentals", authenticate, requireRole("OWNER"), validateBody(createRentalSchema), create);
router.patch("/rentals/:id", authenticate, requireRole("OWNER"), validateBody(updateRentalSchema), update);
router.delete("/rentals/:id", authenticate, requireRole("OWNER"), remove);

export default router;
