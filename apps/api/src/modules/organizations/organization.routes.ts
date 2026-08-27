import { Router, type IRouter } from "express";
import { get, update, updateStatus, remove } from "./organization.controller";
import {
  authenticate,
  requireRole,
  validateParams,
} from "../../middleware";
import {
  updateOrganizationSchema,
  updateOrganizationStatusParamsSchema,
  updateOrganizationStatusSchema,
} from "./organization.validation";
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
router.patch(
  "/platform/organizations/:organizationId/status",
  authenticate,
  requireRole("PLATFORM_OWNER"),
  validateParams(updateOrganizationStatusParamsSchema),
  validateBody(updateOrganizationStatusSchema),
  updateStatus,
);

export default router;
