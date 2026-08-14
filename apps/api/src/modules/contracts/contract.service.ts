import { AppError } from "../../shared";
import * as repo from "./contract.repository";
import type { ContractResponse } from "./contract.types";

const GENERATABLE_RENTAL_STATUSES = ["RESERVED", "ACTIVE"];

function toResponse(record: {
  id: string;
  rental_id: string;
  pickup_date: Date;
  expected_return_date: Date;
  daily_rate: { toString(): string };
  total_amount: { toString(): string };
  deposit_amount: { toString(): string };
  customer_first_name: string;
  customer_last_name: string;
  customer_national_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate_number: string;
  created_at: Date;
  updated_at: Date;
}): ContractResponse {
  return {
    id: record.id,
    rentalId: record.rental_id,
    pickupDate: record.pickup_date.toISOString(),
    expectedReturnDate: record.expected_return_date.toISOString(),
    dailyRate: Number(record.daily_rate.toString()),
    totalAmount: Number(record.total_amount.toString()),
    depositAmount: Number(record.deposit_amount.toString()),
    customerFirstName: record.customer_first_name,
    customerLastName: record.customer_last_name,
    customerNationalId: record.customer_national_id,
    vehicleMake: record.vehicle_make,
    vehicleModel: record.vehicle_model,
    vehiclePlateNumber: record.vehicle_plate_number,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

async function getContract(rentalId: string, orgId: string): Promise<ContractResponse> {
  const contract = await repo.findByRental(rentalId, orgId);

  if (!contract || contract.deleted_at) {
    throw new AppError(404, "CONTRACT_NOT_FOUND", "Contract not found for this rental.");
  }

  return toResponse(contract);
}

async function generateContract(rentalId: string, orgId: string): Promise<ContractResponse> {
  const existing = await repo.findByRental(rentalId, orgId);

  if (existing) {
    throw new AppError(409, "CONTRACT_EXISTS", "This rental already has a contract.");
  }

  const data = await repo.findRentalWithRelations(rentalId, orgId);

  if (!data.rental) {
    throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
  }

  if (!GENERATABLE_RENTAL_STATUSES.includes(data.rental.status)) {
    throw new AppError(409, "INVALID_RENTAL_STATE", "Contract can only be generated for a reserved or active rental.");
  }

  if (!data.customer || !data.vehicle) {
    throw new AppError(409, "RENTAL_MISSING_RELATIONS", "Rental is missing customer or vehicle information.");
  }

  const contract = await repo.create({
    organization_id: data.rental.organization_id,
    rental_id: rentalId,
    pickup_date: data.rental.pickup_date,
    expected_return_date: data.rental.expected_return_date,
    daily_rate: Number(data.rental.daily_rate.toString()),
    total_amount: Number(data.rental.total_amount.toString()),
    deposit_amount: Number(data.rental.deposit_amount.toString()),
    customer_first_name: data.customer.first_name,
    customer_last_name: data.customer.last_name,
    customer_national_id: data.customer.national_id,
    vehicle_make: data.vehicle.make,
    vehicle_model: data.vehicle.model,
    vehicle_plate_number: data.vehicle.plate_number,
  });

  return toResponse(contract);
}

async function deleteContract(rentalId: string, orgId: string): Promise<void> {
  const contract = await repo.findByRental(rentalId, orgId);

  if (!contract || contract.deleted_at) {
    throw new AppError(404, "CONTRACT_NOT_FOUND", "Contract not found for this rental.");
  }

  await repo.softDelete(contract.id);
}

export { getContract, generateContract, deleteContract };
