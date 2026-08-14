import { AppError } from "../../shared";
import * as repo from "./rental.repository";
import type { RentalResponse, CreateRentalInput, UpdateRentalInput } from "./rental.types";

function toResponse(record: {
  id: string;
  customer_id: string;
  vehicle_id: string;
  pickup_date: Date;
  expected_return_date: Date;
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
    actualReturnDate: record.actual_return_date ? record.actual_return_date.toISOString() : null,
    status: record.status as RentalResponse["status"],
    dailyRate: Number(record.daily_rate.toString()),
    totalAmount: Number(record.total_amount.toString()),
    depositAmount: Number(record.deposit_amount.toString()),
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

async function listRentals(orgId: string, search?: string): Promise<RentalResponse[]> {
  const rentals = search ? await repo.searchByOrg(orgId, search) : await repo.findByOrg(orgId);
  return rentals.map(toResponse);
}

async function getRental(rentalId: string, orgId: string): Promise<RentalResponse> {
  const rental = await repo.findById(rentalId, orgId);

  if (!rental || rental.deleted_at) {
    throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
  }

  return toResponse(rental);
}

async function createRental(
  orgId: string,
  input: CreateRentalInput,
): Promise<RentalResponse> {
  const customer = await repo.findCustomer(input.customer_id, orgId);

  if (!customer) {
    throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found.");
  }

  const vehicle = await repo.findVehicle(input.vehicle_id, orgId);

  if (!vehicle) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
  }

  const rental = await repo.create({
    organization_id: orgId,
    customer_id: input.customer_id,
    vehicle_id: input.vehicle_id,
    pickup_date: new Date(input.pickup_date),
    expected_return_date: new Date(input.expected_return_date),
    status: input.status,
    daily_rate: input.daily_rate,
    total_amount: input.total_amount,
    deposit_amount: input.deposit_amount,
  });

  return toResponse(rental);
}

async function updateRental(
  rentalId: string,
  orgId: string,
  input: UpdateRentalInput,
): Promise<RentalResponse> {
  const rental = await repo.findById(rentalId, orgId);

  if (!rental || rental.deleted_at) {
    throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
  }

  const updated = await repo.update(rentalId, {
    pickup_date: input.pickup_date ? new Date(input.pickup_date) : undefined,
    expected_return_date: input.expected_return_date ? new Date(input.expected_return_date) : undefined,
    actual_return_date: input.actual_return_date === null || input.actual_return_date === undefined
      ? undefined
      : new Date(input.actual_return_date),
    status: input.status,
    daily_rate: input.daily_rate,
    total_amount: input.total_amount,
    deposit_amount: input.deposit_amount,
  });

  return toResponse(updated);
}

async function deleteRental(rentalId: string, orgId: string): Promise<void> {
  const rental = await repo.findById(rentalId, orgId);

  if (!rental || rental.deleted_at) {
    throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
  }

  await repo.softDelete(rentalId);
}

export { listRentals, getRental, createRental, updateRental, deleteRental };
