import { Router, type IRouter } from "express";
import { authenticate, requireOperationalOrganization, requireRole, validateBody } from "../../middleware";
import { accept, create } from "./invitation.controller";
import {
  acceptEmployeeInvitationSchema,
  createEmployeeInvitationSchema,
} from "./invitation.validation";

const invitationRouter: IRouter = Router();
const publicInvitationRouter: IRouter = Router();

invitationRouter.post(
  "/users/invitations",
  authenticate,
  requireOperationalOrganization,
  requireRole("OWNER"),
  validateBody(createEmployeeInvitationSchema),
  create,
);

publicInvitationRouter.post(
  "/auth/invitations/accept",
  validateBody(acceptEmployeeInvitationSchema),
  accept,
);

export { invitationRouter, publicInvitationRouter };
