import { AppError } from "../../shared";
import { transaction, isTransactionConflictError } from "../../database";
import * as repo from "./rental.repository";
import type { AvailableVehicleRow } from "./rental.repository";
import type {
  RentalResponse,
  CreateRentalInput,
  UpdateRentalInput,
} from "./rental.types";

interface AvailableVehicleResponse {
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

function toVehicleResponse(record: AvailableVehicleRow): AvailableVehicleResponse {
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

function toResponse(record: {
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
    actualPickupDate: record.actual_pickup_date ? record.actual_pickup_date.toISOString() : null,
    actualReturnDate: record.actual_return_date ? record.actual_return_date.toISOString() : null,
    status: record.status as RentalResponse["status"],
    dailyRate: Number(record.daily_rate.toString()),
    totalAmount: Number(record.total_amount.toString()),
    depositAmount: Number(record.deposit_amount.toString()),
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

function assertValidPeriod(pickupDate: Date, expectedReturnDate: Date): void {
  if (expectedReturnDate.getTime() <= pickupDate.getTime()) {
    throw new AppError(422, "INVALID_RENTAL_PERIOD", "Expected return date must be after the pickup date.");
  }
}

function assertVehicleOperationallyAvailable(vehicleStatus: string): void {
  if (vehicleStatus === "MAINTENANCE" || vehicleStatus === "OUT_OF_SERVICE" || vehicleStatus === "ARCHIVED") {
    throw new AppError(409, "VEHICLE_UNAVAILABLE", "Vehicle is not available for rental.");
  }
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
  const pickupDate = new Date(input.pickup_date);
  const expectedReturnDate = new Date(input.expected_return_date);

  assertValidPeriod(pickupDate, expectedReturnDate);

  async function run(): Promise<RentalResponse> {
    const rental = await transaction(async (tx) => {
      const customer = await repo.findCustomerWithinTx(input.customer_id, orgId, tx);

      if (!customer) {
        throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found.");
      }

      const vehicle = await repo.findVehicleWithinTx(input.vehicle_id, orgId, tx);

      if (!vehicle) {
        throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
      }

      assertVehicleOperationallyAvailable(vehicle.status);

      const overlapping = await repo.findOverlappingWithinTx(
        input.vehicle_id,
        orgId,
        pickupDate,
        expectedReturnDate,
        undefined,
        tx,
      );

      if (overlapping.length > 0) {
        throw new AppError(409, "VEHICLE_UNAVAILABLE", "Vehicle is already reserved for the requested period.");
      }

      const rental = await repo.createWithinTx(
        {
          organization_id: orgId,
          customer_id: input.customer_id,
          vehicle_id: input.vehicle_id,
          pickup_date: pickupDate,
          expected_return_date: expectedReturnDate,
          status: "RESERVED",
          daily_rate: input.daily_rate,
          total_amount: input.total_amount,
          deposit_amount: input.deposit_amount,
        },
        tx,
      );

      await repo.updateVehicleStatusWithinTx(input.vehicle_id, "RESERVED", tx);

      return rental;
    }, { isolationLevel: "Serializable" });

    return toResponse(rental);
  }

  try {
    return await run();
  } catch (err) {
    if (isTransactionConflictError(err)) {
      return await run();
    }
    throw err;
  }
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
    actual_pickup_date: input.actual_pickup_date === null || input.actual_pickup_date === undefined
      ? undefined
      : new Date(input.actual_pickup_date),
    actual_return_date: input.actual_return_date === null || input.actual_return_date === undefined
      ? undefined
      : new Date(input.actual_return_date),
    daily_rate: input.daily_rate,
    total_amount: input.total_amount,
    deposit_amount: input.deposit_amount,
  });

  return toResponse(updated);
}

async function pickupRental(
  rentalId: string,
  orgId: string,
  actualPickupDate: Date,
): Promise<RentalResponse> {
  return transaction(async (tx) => {
    const rental = await repo.findByIdWithinTx(rentalId, orgId, tx);

    if (!rental || rental.deleted_at) {
      throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
    }

    if (rental.status !== "RESERVED") {
      throw new AppError(409, "INVALID_RENTAL_TRANSITION", "Only a reserved rental can be picked up.");
    }

    const updated = await repo.updateWithinTx(
      rentalId,
      {
        status: "ACTIVE",
        actual_pickup_date: new Date(actualPickupDate),
      },
      tx,
    );

    await repo.updateVehicleStatusWithinTx(rental.vehicle_id, "RENTED", tx);

    return updated;
  }, { isolationLevel: "Serializable" }).then(toResponse);
}

async function returnRental(
  rentalId: string,
  orgId: string,
  actualReturnDate: Date,
): Promise<RentalResponse> {
  return transaction(async (tx) => {
    const rental = await repo.findByIdWithinTx(rentalId, orgId, tx);

    if (!rental || rental.deleted_at) {
      throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
    }

    if (rental.status !== "ACTIVE") {
      throw new AppError(409, "INVALID_RENTAL_TRANSITION", "Only an active rental can be returned.");
    }

    const updated = await repo.updateWithinTx(
      rentalId,
      {
        status: "RETURNED",
        actual_return_date: new Date(actualReturnDate),
      },
      tx,
    );

    const vehicle = await repo.findVehicleWithinTx(rental.vehicle_id, orgId, tx);

    if (vehicle && vehicle.status === "RENTED") {
      await repo.updateVehicleStatusWithinTx(rental.vehicle_id, "AVAILABLE", tx);
    }

    return updated;
  }, { isolationLevel: "Serializable" }).then(toResponse);
}

async function extendRental(
  rentalId: string,
  orgId: string,
  expectedReturnDate: Date,
): Promise<RentalResponse> {
  return transaction(async (tx) => {
    const rental = await repo.findByIdWithinTx(rentalId, orgId, tx);

    if (!rental || rental.deleted_at) {
      throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
    }

    if (rental.status !== "RESERVED" && rental.status !== "ACTIVE") {
      throw new AppError(409, "INVALID_RENTAL_TRANSITION", "Only a reserved or active rental can be extended.");
    }

    const newReturnDate = new Date(expectedReturnDate);

    if (newReturnDate.getTime() <= rental.pickup_date.getTime()) {
      throw new AppError(422, "INVALID_RENTAL_PERIOD", "Expected return date must be after the pickup date.");
    }

    if (newReturnDate.getTime() <= rental.expected_return_date.getTime()) {
      throw new AppError(422, "INVALID_RENTAL_EXTENSION", "New expected return date must be after the current expected return date.");
    }

    const overlapping = await repo.findOverlappingWithinTx(
      rental.vehicle_id,
      orgId,
      rental.pickup_date,
      newReturnDate,
      rental.id,
      tx,
    );

    if (overlapping.length > 0) {
      throw new AppError(409, "VEHICLE_UNAVAILABLE", "Vehicle is already reserved during part of the extended period.");
    }

    const updated = await repo.updateWithinTx(
      rentalId,
      { expected_return_date: newReturnDate },
      tx,
    );

    return updated;
  }, { isolationLevel: "Serializable" }).then(toResponse);
}

async function cancelRental(rentalId: string, orgId: string): Promise<RentalResponse> {
  return transaction(async (tx) => {
    const rental = await repo.findByIdWithinTx(rentalId, orgId, tx);

    if (!rental || rental.deleted_at) {
      throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
    }

    if (rental.status !== "RESERVED") {
      throw new AppError(409, "INVALID_RENTAL_TRANSITION", "Only a reserved rental can be cancelled.");
    }

    const updated = await repo.updateWithinTx(
      rentalId,
      { status: "CANCELLED" },
      tx,
    );

    const vehicle = await repo.findVehicleWithinTx(rental.vehicle_id, orgId, tx);

    if (vehicle && vehicle.status === "RESERVED") {
      await repo.updateVehicleStatusWithinTx(rental.vehicle_id, "AVAILABLE", tx);
    }

    return updated;
  }, { isolationLevel: "Serializable" }).then(toResponse);
}

async function deleteRental(rentalId: string, orgId: string): Promise<void> {
  const rental = await repo.findById(rentalId, orgId);

  if (!rental || rental.deleted_at) {
    throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
  }

  await repo.softDelete(rentalId);
}

async function checkAvailability(
  orgId: string,
  vehicleId: string,
  pickupDate: Date,
  expectedReturnDate: Date,
  excludeRentalId?: string,
): Promise<{ available: boolean; conflictingRentalId: string | null }> {
  const vehicle = await repo.findVehicle(vehicleId, orgId);

  if (!vehicle) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
  }

  assertValidPeriod(pickupDate, expectedReturnDate);

  if (
    vehicle.status === "MAINTENANCE" ||
    vehicle.status === "OUT_OF_SERVICE" ||
    vehicle.status === "ARCHIVED"
  ) {
    return { available: false, conflictingRentalId: null };
  }

  const overlapping = await repo.findOverlapping(
    vehicleId,
    orgId,
    pickupDate,
    expectedReturnDate,
    excludeRentalId,
  );

  if (overlapping.length > 0) {
    return { available: false, conflictingRentalId: overlapping[0].id };
  }

  return { available: true, conflictingRentalId: null };
}

async function listAvailableVehicles(
  orgId: string,
  pickupDate: Date,
  expectedReturnDate: Date,
): Promise<AvailableVehicleResponse[]> {
  assertValidPeriod(pickupDate, expectedReturnDate);

  const vehicles = await repo.findAvailableVehicles(orgId, pickupDate, expectedReturnDate);
  return vehicles.map(toVehicleResponse);
}

export {
  listRentals,
  getRental,
  createRental,
  updateRental,
  pickupRental,
  returnRental,
  extendRental,
  cancelRental,
  deleteRental,
  checkAvailability,
  listAvailableVehicles,
};
