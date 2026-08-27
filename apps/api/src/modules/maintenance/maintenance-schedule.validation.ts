import { z } from "zod";
import {
  ListMaintenanceSchedulesQueryParams,
  GetMaintenanceScheduleParams,
  UpdateMaintenanceScheduleParams,
  DeleteMaintenanceScheduleParams,
} from "@workspace/api-zod";
import type {
  CreateMaintenanceScheduleInput,
  UpdateMaintenanceScheduleInput,
} from "./maintenance-schedule.types";

const maintenanceType = z.enum([
  "PREVENTIVE_SERVICE",
  "INSPECTION",
  "REPAIR",
  "OTHER",
]);
const scheduleType = z.enum(["DATE", "MILEAGE", "DATE_OR_MILEAGE"]);
const businessDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a YYYY-MM-DD business date.");

export const createMaintenanceScheduleSchema = z.object({
  vehicle_id: z.string().min(1),
  maintenance_type: maintenanceType,
  schedule_type: scheduleType,
  date_interval_days: z.number().int().positive().nullable().optional(),
  next_due_date: businessDate.nullable().optional(),
  mileage_interval: z.number().int().positive().nullable().optional(),
  next_due_mileage: z.number().int().nonnegative().nullable().optional(),
  is_active: z.boolean().optional(),
});

export const updateMaintenanceScheduleSchema = z
  .object({
    maintenance_type: maintenanceType.optional(),
    schedule_type: scheduleType.optional(),
    date_interval_days: z.number().int().positive().nullable().optional(),
    next_due_date: businessDate.nullable().optional(),
    mileage_interval: z.number().int().positive().nullable().optional(),
    next_due_mileage: z.number().int().nonnegative().nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one schedule field is required.",
  });

export const listMaintenanceSchedulesQuerySchema =
  ListMaintenanceSchedulesQueryParams;
export const getMaintenanceScheduleParamsSchema = GetMaintenanceScheduleParams;
export const updateMaintenanceScheduleParamsSchema =
  UpdateMaintenanceScheduleParams;
export const deleteMaintenanceScheduleParamsSchema =
  DeleteMaintenanceScheduleParams;

export type ListMaintenanceSchedulesQuery = { vehicleId?: string };
export type { CreateMaintenanceScheduleInput, UpdateMaintenanceScheduleInput };
