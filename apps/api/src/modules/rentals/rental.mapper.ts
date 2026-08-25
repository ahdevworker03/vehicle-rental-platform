import type { AvailableVehicleRow } from "./rental.repository";
import type { RentalResponse } from "./rental.types";

export interface AvailableVehicleResponse {
  id: string;
  make: string;
  model: string;
  plateNumber: string;
  year: number;
  color: string;
  vin: string | null;
  engineNumber: string | null;
  transmission: string;
  fuelType: string;
  seats: number;
  currentMileage: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function toAvailableVehicleResponse(
  record: AvailableVehicleRow,
): AvailableVehicleResponse {
  return {
    id: record.id,
    make: record.make,
    model: record.model,
    plateNumber: record.plate_number,
    year: record.year,
    color: record.color,
    vin: record.vin,
    engineNumber: record.engine_number,
    transmission: record.transmission,
    fuelType: record.fuel_type,
    seats: record.seats,
    currentMileage: record.current_mileage,
    status: record.status,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

export function toRentalResponse(record: {
  id: string;
  customer_id: string;
  vehicle_id: string;
  pickup_date: Date;
  expected_return_date: Date;
  actual_pickup_date: Date | null;
  actual_return_date: Date | null;
  status: string;
  daily_rate: { toString(): string };
  total_amount: { toString(): string };
  deposit_amount: { toString(): string };
  created_at: Date;
  updated_at: Date;
}): RentalResponse {
  return {
    id: record.id,
    customerId: record.customer_id,
    vehicleId: record.vehicle_id,
    pickupDate: record.pickup_date.toISOString(),
    expectedReturnDate: record.expected_return_date.toISOString(),
    actualPickupDate: record.actual_pickup_date
      ? record.actual_pickup_date.toISOString()
      : null,
    actualReturnDate: record.actual_return_date
      ? record.actual_return_date.toISOString()
      : null,
    status: record.status as RentalResponse["status"],
    dailyRate: Number(record.daily_rate.toString()),
    totalAmount: Number(record.total_amount.toString()),
    depositAmount: Number(record.deposit_amount.toString()),
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}
