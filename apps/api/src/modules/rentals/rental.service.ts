import { AppError } from "../../shared";
import { transaction, retrySerializable } from "../../database";
import * as repo from "./rental.repository";
import type {
  RentalResponse,
  CreateRentalInput,
  UpdateRentalInput,
} from "./rental.types";
import {
  toAvailableVehicleResponse,
  toRentalResponse,
  type AvailableVehicleResponse,
} from "./rental.mapper";
import {
  assertPatchDoesNotChangeStatus,
  assertRentalCanBeAmended,
  assertValidAmounts,
  assertValidPeriod,
  assertVehicleOperationallyAvailable,
} from "./rental.rules";

async function listRentals(
  orgId: string,
  search?: string,
): Promise<RentalResponse[]> {
  const rentals = search
    ? await repo.searchByOrg(orgId, search)
    : await repo.findByOrg(orgId);
  return rentals.map(toRentalResponse);
}

async function getRental(
  rentalId: string,
  orgId: string,
): Promise<RentalResponse> {
  const rental = await repo.findById(rentalId, orgId);

  if (!rental || rental.deleted_at) {
    throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
  }

  return toRentalResponse(rental);
}

async function createRental(
  orgId: string,
  input: CreateRentalInput,
): Promise<RentalResponse> {
  const pickupDate = new Date(input.pickup_date);
  const expectedReturnDate = new Date(input.expected_return_date);

  assertValidPeriod(pickupDate, expectedReturnDate);
  assertValidAmounts(
    input.daily_rate,
    input.total_amount,
    input.deposit_amount,
  );

  async function run(): Promise<RentalResponse> {
    const rental = await transaction(
      async (tx) => {
        const customer = await repo.findCustomerWithinTx(
          input.customer_id,
          orgId,
          tx,
        );

        if (!customer) {
          throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found.");
        }

        const vehicle = await repo.findVehicleWithinTx(
          input.vehicle_id,
          orgId,
          tx,
        );

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
          throw new AppError(
            409,
            "VEHICLE_UNAVAILABLE",
            "Vehicle is already reserved for the requested period.",
          );
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

        await repo.updateVehicleStatusWithinTx(
          input.vehicle_id,
          "RESERVED",
          tx,
        );

        return rental;
      },
      { isolationLevel: "Serializable" },
    );

    return toRentalResponse(rental);
  }

  return retrySerializable(run);
}

async function updateRental(
  rentalId: string,
  orgId: string,
  input: UpdateRentalInput,
): Promise<RentalResponse> {
  assertPatchDoesNotChangeStatus(input);

  const run = () =>
    transaction(
      async (tx) => {
        const rental = await repo.findByIdWithinTx(rentalId, orgId, tx);

        if (!rental || rental.deleted_at) {
          throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
        }

        assertRentalCanBeAmended(rental.status);

        const pickupDate = input.pickup_date ?? rental.pickup_date;
        const expectedReturnDate =
          input.expected_return_date ?? rental.expected_return_date;
        const dailyRate = input.daily_rate ?? Number(rental.daily_rate.toString());
        const totalAmount =
          input.total_amount ?? Number(rental.total_amount.toString());
        const depositAmount =
          input.deposit_amount ?? Number(rental.deposit_amount.toString());

        assertValidPeriod(pickupDate, expectedReturnDate);
        assertValidAmounts(dailyRate, totalAmount, depositAmount);

        const overlapping = await repo.findOverlappingWithinTx(
          rental.vehicle_id,
          orgId,
          pickupDate,
          expectedReturnDate,
          rental.id,
          tx,
        );

        if (overlapping.length > 0) {
          throw new AppError(
            409,
            "VEHICLE_UNAVAILABLE",
            "Vehicle is already reserved for the requested period.",
          );
        }

        return repo.updateWithinTx(
          rentalId,
          {
            pickup_date: input.pickup_date,
            expected_return_date: input.expected_return_date,
            actual_pickup_date:
              input.actual_pickup_date === null ||
              input.actual_pickup_date === undefined
                ? undefined
                : input.actual_pickup_date,
            actual_return_date:
              input.actual_return_date === null ||
              input.actual_return_date === undefined
                ? undefined
                : input.actual_return_date,
            daily_rate: input.daily_rate,
            total_amount: input.total_amount,
            deposit_amount: input.deposit_amount,
          },
          tx,
        );
      },
      { isolationLevel: "Serializable" },
    );

  return retrySerializable(run).then(toRentalResponse);
}

async function pickupRental(
  rentalId: string,
  orgId: string,
  actualPickupDate: Date,
): Promise<RentalResponse> {
  return transaction(
    async (tx) => {
      const rental = await repo.findByIdWithinTx(rentalId, orgId, tx);

      if (!rental || rental.deleted_at) {
        throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
      }

      if (rental.status !== "RESERVED") {
        throw new AppError(
          409,
          "INVALID_RENTAL_TRANSITION",
          "Only a reserved rental can be picked up.",
        );
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
    },
    { isolationLevel: "Serializable" },
  ).then(toRentalResponse);
}

async function returnRental(
  rentalId: string,
  orgId: string,
  actualReturnDate: Date,
): Promise<RentalResponse> {
  return transaction(
    async (tx) => {
      const rental = await repo.findByIdWithinTx(rentalId, orgId, tx);

      if (!rental || rental.deleted_at) {
        throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
      }

      if (rental.status !== "ACTIVE") {
        throw new AppError(
          409,
          "INVALID_RENTAL_TRANSITION",
          "Only an active rental can be returned.",
        );
      }

      const updated = await repo.updateWithinTx(
        rentalId,
        {
          status: "RETURNED",
          actual_return_date: new Date(actualReturnDate),
        },
        tx,
      );

      const vehicle = await repo.findVehicleWithinTx(
        rental.vehicle_id,
        orgId,
        tx,
      );

      if (vehicle && vehicle.status === "RENTED") {
        await repo.updateVehicleStatusWithinTx(
          rental.vehicle_id,
          "AVAILABLE",
          tx,
        );
      }

      return updated;
    },
    { isolationLevel: "Serializable" },
  ).then(toRentalResponse);
}

async function extendRental(
  rentalId: string,
  orgId: string,
  expectedReturnDate: Date,
): Promise<RentalResponse> {
  return transaction(
    async (tx) => {
      const rental = await repo.findByIdWithinTx(rentalId, orgId, tx);

      if (!rental || rental.deleted_at) {
        throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
      }

      if (rental.status !== "RESERVED" && rental.status !== "ACTIVE") {
        throw new AppError(
          409,
          "INVALID_RENTAL_TRANSITION",
          "Only a reserved or active rental can be extended.",
        );
      }

      const newReturnDate = new Date(expectedReturnDate);

      if (newReturnDate.getTime() <= rental.pickup_date.getTime()) {
        throw new AppError(
          422,
          "INVALID_RENTAL_PERIOD",
          "Expected return date must be after the pickup date.",
        );
      }

      if (newReturnDate.getTime() <= rental.expected_return_date.getTime()) {
        throw new AppError(
          422,
          "INVALID_RENTAL_EXTENSION",
          "New expected return date must be after the current expected return date.",
        );
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
        throw new AppError(
          409,
          "VEHICLE_UNAVAILABLE",
          "Vehicle is already reserved during part of the extended period.",
        );
      }

      const updated = await repo.updateWithinTx(
        rentalId,
        { expected_return_date: newReturnDate },
        tx,
      );

      return updated;
    },
    { isolationLevel: "Serializable" },
  ).then(toRentalResponse);
}

async function cancelRental(
  rentalId: string,
  orgId: string,
): Promise<RentalResponse> {
  return transaction(
    async (tx) => {
      const rental = await repo.findByIdWithinTx(rentalId, orgId, tx);

      if (!rental || rental.deleted_at) {
        throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
      }

      if (rental.status !== "RESERVED") {
        throw new AppError(
          409,
          "INVALID_RENTAL_TRANSITION",
          "Only a reserved rental can be cancelled.",
        );
      }

      const updated = await repo.updateWithinTx(
        rentalId,
        { status: "CANCELLED" },
        tx,
      );

      const vehicle = await repo.findVehicleWithinTx(
        rental.vehicle_id,
        orgId,
        tx,
      );

      if (vehicle && vehicle.status === "RESERVED") {
        await repo.updateVehicleStatusWithinTx(
          rental.vehicle_id,
          "AVAILABLE",
          tx,
        );
      }

      return updated;
    },
    { isolationLevel: "Serializable" },
  ).then(toRentalResponse);
}

async function deleteRental(rentalId: string, orgId: string): Promise<void> {
  const run = () =>
    transaction(
      async (tx) => {
        const rental = await repo.findByIdWithinTx(rentalId, orgId, tx);

        if (!rental || rental.deleted_at) {
          throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
        }

        if (rental.status === "ACTIVE") {
          throw new AppError(
            409,
            "ACTIVE_RENTAL_CANNOT_BE_DELETED",
            "An active rental cannot be deleted. Return it through the rental lifecycle.",
          );
        }

        if (rental.status !== "RESERVED") {
          throw new AppError(
            409,
            "INVALID_RENTAL_TRANSITION",
            "Only a reserved rental can be deleted. Cancel it to release the vehicle.",
          );
        }

        await repo.softDeleteWithinTx(rentalId, tx);

        const vehicle = await repo.findVehicleWithinTx(
          rental.vehicle_id,
          orgId,
          tx,
        );
        const liveRentals = await repo.findLiveByVehicleWithinTx(
          rental.vehicle_id,
          orgId,
          tx,
        );

        if (!vehicle) {
          return;
        }

        if (liveRentals.some((liveRental) => liveRental.status === "ACTIVE")) {
          await repo.updateVehicleStatusWithinTx(
            rental.vehicle_id,
            "RENTED",
            tx,
          );
          return;
        }

        if (liveRentals.some((liveRental) => liveRental.status === "RESERVED")) {
          await repo.updateVehicleStatusWithinTx(
            rental.vehicle_id,
            "RESERVED",
            tx,
          );
          return;
        }

        if (vehicle.status === "RESERVED") {
          await repo.updateVehicleStatusWithinTx(
            rental.vehicle_id,
            "AVAILABLE",
            tx,
          );
        }
      },
      { isolationLevel: "Serializable" },
    );

  await retrySerializable(run);
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

  const vehicles = await repo.findAvailableVehicles(
    orgId,
    pickupDate,
    expectedReturnDate,
  );
  return vehicles.map(toAvailableVehicleResponse);
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
