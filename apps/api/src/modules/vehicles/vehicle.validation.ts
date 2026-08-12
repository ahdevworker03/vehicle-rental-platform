import { z } from "zod";

const vehicleStatusEnum = z.enum(["AVAILABLE", "RESERVED", "RENTED", "MAINTENANCE", "OUT_OF_SERVICE", "ARCHIVED"], {
  errorMap: () => ({ message: "Status must be a valid vehicle status" }),
});

const transmissionEnum = z.enum(["MANUAL", "AUTOMATIC"], {
  errorMap: () => ({ message: "Transmission must be MANUAL or AUTOMATIC" }),
});

const fuelTypeEnum = z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID"], {
  errorMap: () => ({ message: "Fuel type must be PETROL, DIESEL, ELECTRIC, or HYBRID" }),
});

export const createVehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  plate_number: z.string().min(1, "Plate number is required"),
  year: z.number().int("Year must be an integer").min(1900, "Year must be 1900 or later").max(2100, "Year must be 2100 or earlier"),
  color: z.string().min(1, "Color is required"),
  vin: z.string().optional(),
  engine_number: z.string().optional(),
  transmission: transmissionEnum,
  fuel_type: fuelTypeEnum,
  seats: z.number().int("Seats must be an integer").positive("Seats must be a positive number"),
  current_mileage: z.number().int("Mileage must be an integer").nonnegative("Mileage must not be negative"),
  status: vehicleStatusEnum,
});

export const updateVehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  plate_number: z.string().min(1, "Plate number is required"),
  year: z.number().int("Year must be an integer").min(1900, "Year must be 1900 or later").max(2100, "Year must be 2100 or earlier"),
  color: z.string().min(1, "Color is required"),
  vin: z.string().optional(),
  engine_number: z.string().optional(),
  transmission: transmissionEnum,
  fuel_type: fuelTypeEnum,
  seats: z.number().int("Seats must be an integer").positive("Seats must be a positive number"),
  current_mileage: z.number().int("Mileage must be an integer").nonnegative("Mileage must not be negative"),
  status: vehicleStatusEnum,
});

export const listVehiclesQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, "Search term must not be empty")
    .max(200, "Search term is too long")
    .optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type ListVehiclesQuery = z.infer<typeof listVehiclesQuerySchema>;
