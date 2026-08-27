import {
  UpdateMyOrganizationBody,
  UpdateOrganizationStatusBody,
  UpdateOrganizationStatusParams,
} from "@workspace/api-zod";

export const updateOrganizationSchema = UpdateMyOrganizationBody.refine(
  (input) => Object.values(input).some((value) => value !== undefined),
  "At least one organization profile field is required.",
);
export const updateOrganizationStatusSchema = UpdateOrganizationStatusBody;
export const updateOrganizationStatusParamsSchema = UpdateOrganizationStatusParams;

export type { UpdateOrganizationInput } from "./organization.types";
export type UpdateOrganizationStatusInput = {
  status: "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";
};
