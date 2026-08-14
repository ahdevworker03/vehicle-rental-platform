import type { Decimal } from "@prisma/client/runtime/client";

export type RentalStatus = "RESERVED" | "ACTIVE" | "RETURNED" | "CANCELLED";

export type VehicleStatus = "AVAILABLE" | "RESERVED" | "RENTED" | "MAINTENANCE" | "OUT_OF_SERVICE" | "ARCHIVED";

export interface RentalRecord {
  id: string;
  organization_id: string;
  customer_id: string;
  vehicle_id: string;
  pickup_date: Date;
  expected_return_date: Date;
  actual_pickup_date: Date | null;
  actual_return_date: Date | null;
  status: RentalStatus;
  daily_rate: Decimal;
  total_amount: Decimal;
  deposit_amount: Decimal;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface RentalResponse {
  id: string;
  customerId: string;
  vehicleId: string;
  pickupDate: string;
  expectedReturnDate: string;
  actualPickupDate: string | null;
  actualReturnDate: string | null;
  status: RentalStatus;
  dailyRate: number;
  totalAmount: number;
  depositAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRentalInput {
  customer_id: string;
  vehicle_id: string;
  pickup_date: Date;
  expected_return_date: Date;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  status: RentalStatus;
}

export interface UpdateRentalInput {
  pickup_date?: Date;
  expected_return_date?: Date;
  actual_pickup_date?: Date | null;
  actual_return_date?: Date | null;
  daily_rate?: number;
  total_amount?: number;
  deposit_amount?: number;
  status?: RentalStatus;
}
