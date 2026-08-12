import { z } from "zod";

const validDate = z.string().refine((value) => !isNaN(new Date(value).getTime()), {
  message: "License expiry date must be a valid date",
});

export const createCustomerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  national_id: z.string().min(1, "National ID is required"),
  license_number: z.string().min(1, "License number is required"),
  license_expiry_date: validDate,
});

export const updateCustomerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  national_id: z.string().min(1, "National ID is required"),
  license_number: z.string().min(1, "License number is required"),
  license_expiry_date: validDate,
});

export const listCustomersQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, "Search term must not be empty")
    .max(200, "Search term is too long")
    .optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
