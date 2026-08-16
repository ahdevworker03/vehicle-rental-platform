import type { Decimal } from "@prisma/client/runtime/client";

export type MaintenanceType =
  | "PREVENTIVE_SERVICE"
  | "INSPECTION"
  | "REPAIR"
  | "OTHER";

export type MaintenanceStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";

export interface MaintenanceReplacedPart {
  name: string;
  brand?: string;
  quantity?: number;
  unitCost?: number;
}

export interface MaintenanceRecord {
  id: string;
  organization_id: string;
  vehicle_id: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  maintenance_date: Date;
  completed_at: Date | null;
  cost: Decimal | null;
  vendor: string | null;
  notes: string | null;
  replaced_parts: unknown | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface MaintenanceResponse {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  maintenanceDate: string;
  completedAt: string | null;
  cost: number | null;
  vendor: string | null;
  notes: string | null;
  replacedParts: MaintenanceReplacedPart[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceInput {
  vehicle_id: string;
  type: MaintenanceType;
  maintenance_date: Date;
  cost?: number;
  vendor?: string;
  notes?: string;
  replaced_parts?: MaintenanceReplacedPart[];
}

export interface UpdateMaintenanceInput {
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  maintenance_date?: Date;
  cost?: number | null;
  vendor?: string | null;
  notes?: string | null;
  replaced_parts?: MaintenanceReplacedPart[] | null;
}

export interface CompleteMaintenanceInput {
  cost: number;
}
