import {
  CreateMaintenanceBody,
  UpdateMaintenanceBody,
  ListMaintenanceQueryParams,
  CompleteMaintenanceBody,
} from "@workspace/api-zod";
import type {
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  CompleteMaintenanceInput,
} from "./maintenance.types";

export const createMaintenanceSchema = CreateMaintenanceBody;
export const updateMaintenanceSchema = UpdateMaintenanceBody;
export const listMaintenanceQuerySchema = ListMaintenanceQueryParams;
export const completeMaintenanceSchema = CompleteMaintenanceBody;

export type ListMaintenanceQuery = { vehicleId?: string };

export type {
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  CompleteMaintenanceInput,
};
