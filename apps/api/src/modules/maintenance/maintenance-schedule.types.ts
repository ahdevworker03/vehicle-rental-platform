import type { MaintenanceType } from "./maintenance.types";

export type MaintenanceScheduleType = "DATE" | "MILEAGE" | "DATE_OR_MILEAGE";

export interface MaintenanceScheduleRecord {
  id: string;
  organization_id: string;
  vehicle_id: string;
  maintenance_type: MaintenanceType;
  schedule_type: MaintenanceScheduleType;
  date_interval_days: number | null;
  next_due_date: Date | null;
  mileage_interval: number | null;
  next_due_mileage: number | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface MaintenanceScheduleResponse {
  id: string;
  vehicleId: string;
  maintenanceType: MaintenanceType;
  scheduleType: MaintenanceScheduleType;
  dateIntervalDays: number | null;
  nextDueDate: string | null;
  mileageInterval: number | null;
  nextDueMileage: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceScheduleInput {
  vehicle_id: string;
  maintenance_type: MaintenanceType;
  schedule_type: MaintenanceScheduleType;
  date_interval_days?: number | null;
  next_due_date?: string | null;
  mileage_interval?: number | null;
  next_due_mileage?: number | null;
  is_active?: boolean;
}

export interface UpdateMaintenanceScheduleInput {
  maintenance_type?: MaintenanceType;
  schedule_type?: MaintenanceScheduleType;
  date_interval_days?: number | null;
  next_due_date?: string | null;
  mileage_interval?: number | null;
  next_due_mileage?: number | null;
  is_active?: boolean;
}
