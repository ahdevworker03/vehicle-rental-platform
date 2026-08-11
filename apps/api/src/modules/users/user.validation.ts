import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["MANAGER", "EMPLOYEE"], {
    errorMap: () => ({ message: "Role must be MANAGER or EMPLOYEE" }),
  }),
});

export const updateUserSchema = z.object({
  role: z.enum(["MANAGER", "EMPLOYEE"], {
    errorMap: () => ({ message: "Role must be MANAGER or EMPLOYEE" }),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
