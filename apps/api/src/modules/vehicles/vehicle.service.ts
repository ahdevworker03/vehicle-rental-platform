import { AppError } from "../../shared";
import { isUniqueConstraintError } from "../../database";
import * as repo from "./vehicle.repository";
import type { VehicleResponse, CreateVehicleInput, UpdateVehicleInput } from "./vehicle.types";

function toResponse(record: {
  id: string;
  make: string;
  model: string;
  plate_number: string;
  year: number;
  color: string;
  vin: string | null;
  engine_number: string | null;
  transmission: string;
  fuel_type: string;
  seats: number;
  current_mileage: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}): VehicleResponse {
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

async function listVehicles(orgId: string): Promise<VehicleResponse[]> {
  const vehicles = await repo.findByOrg(orgId);
  return vehicles.map(toResponse);
}

async function getVehicle(vehicleId: string, orgId: string): Promise<VehicleResponse> {
  const vehicle = await repo.findById(vehicleId, orgId);

  if (!vehicle || vehicle.deleted_at) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
  }

  return toResponse(vehicle);
}

async function createVehicle(
  orgId: string,
  input: CreateVehicleInput,
): Promise<VehicleResponse> {
  try {
    const vehicle = await repo.create(
      {
        make: input.make,
        model: input.model,
        plate_number: input.plate_number,
        year: input.year,
        color: input.color,
        vin: input.vin,
        engine_number: input.engine_number,
        transmission: input.transmission,
        fuel_type: input.fuel_type,
        seats: input.seats,
        current_mileage: input.current_mileage,
        status: input.status,
      },
      orgId,
    );

    return toResponse(vehicle);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AppError(409, "DUPLICATE_PLATE", "A vehicle with this plate number already exists in your organization.");
    }
    throw err;
  }
}

async function updateVehicle(
  vehicleId: string,
  orgId: string,
  input: UpdateVehicleInput,
): Promise<VehicleResponse> {
  const vehicle = await repo.findById(vehicleId, orgId);

  if (!vehicle || vehicle.deleted_at) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
  }

  try {
    const updated = await repo.update(vehicleId, {
      make: input.make,
      model: input.model,
      plate_number: input.plate_number,
      year: input.year,
      color: input.color,
      vin: input.vin,
      engine_number: input.engine_number,
      transmission: input.transmission,
      fuel_type: input.fuel_type,
      seats: input.seats,
      current_mileage: input.current_mileage,
      status: input.status,
    });

    return toResponse(updated);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AppError(409, "DUPLICATE_PLATE", "A vehicle with this plate number already exists in your organization.");
    }
    throw err;
  }
}

async function deleteVehicle(vehicleId: string, orgId: string): Promise<void> {
  const vehicle = await repo.findById(vehicleId, orgId);

  if (!vehicle || vehicle.deleted_at) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
  }

  await repo.softDelete(vehicleId);
}

export { listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle };
