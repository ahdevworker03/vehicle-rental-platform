import { UpdateMyOrganizationBody } from "@workspace/api-zod";

export const updateOrganizationSchema = UpdateMyOrganizationBody;

export type UpdateOrganizationInput = {
  name: string;
};
