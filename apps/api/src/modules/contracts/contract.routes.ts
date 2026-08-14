import { Router, type IRouter } from "express";
import { get, generate, remove } from "./contract.controller";
import { authenticate, requireRole } from "../../middleware";

const router: IRouter = Router();

router.get("/rentals/:id/contract", authenticate, get);
router.post("/rentals/:id/contract", authenticate, requireRole("OWNER"), generate);
router.delete("/rentals/:id/contract", authenticate, requireRole("OWNER"), remove);

export default router;
