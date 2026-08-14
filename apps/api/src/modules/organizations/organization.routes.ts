import { Router, type IRouter } from "express";
import { get, update, remove } from "./organization.controller";
import { authenticate, requireRole } from "../../middleware";
import { updateOrganizationSchema } from "./organization.validation";
import { validateBody } from "../../middleware";

const router: IRouter = Router();

router.get("/organizations/me", authenticate, get);
router.patch(
  "/organizations/me",
  authenticate,
  requireRole("OWNER"),
  validateBody(updateOrganizationSchema),
  update,
);
router.delete("/organizations/me", authenticate, requireRole("OWNER"), remove);

export default router;
