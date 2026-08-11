import { z } from "zod";

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
