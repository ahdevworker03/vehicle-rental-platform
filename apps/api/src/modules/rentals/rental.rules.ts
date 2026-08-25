import { AppError } from "../../shared";
import type { UpdateRentalInput } from "./rental.types";

export function assertValidPeriod(
  pickupDate: Date,
  expectedReturnDate: Date,
): void {
  if (expectedReturnDate.getTime() <= pickupDate.getTime()) {
    throw new AppError(
      422,
      "INVALID_RENTAL_PERIOD",
      "Expected return date must be after the pickup date.",
    );
  }
}

export function assertValidAmounts(
  dailyRate: number,
  totalAmount: number,
  depositAmount: number,
): void {
  if (
    !Number.isFinite(dailyRate) ||
    !Number.isFinite(totalAmount) ||
    !Number.isFinite(depositAmount) ||
    dailyRate < 0 ||
    totalAmount < 0 ||
    depositAmount < 0 ||
    depositAmount > totalAmount
  ) {
    throw new AppError(
      422,
      "INVALID_RENTAL_AMOUNTS",
      "Rental amounts must be non-negative and the deposit cannot exceed the total amount.",
    );
  }
}

export function assertRentalCanBeAmended(status: string): void {
  if (status !== "RESERVED" && status !== "ACTIVE") {
    throw new AppError(
      409,
      "INVALID_RENTAL_TRANSITION",
      "Only a reserved or active rental can be amended.",
    );
  }
}

export function assertPatchDoesNotChangeStatus(input: UpdateRentalInput): void {
  if (input.status !== undefined) {
    throw new AppError(
      409,
      "INVALID_RENTAL_TRANSITION",
      "Rental status must be changed through its lifecycle endpoint.",
    );
  }
}

export function assertVehicleOperationallyAvailable(
  vehicleStatus: string,
): void {
  if (
    vehicleStatus === "MAINTENANCE" ||
    vehicleStatus === "OUT_OF_SERVICE" ||
    vehicleStatus === "ARCHIVED"
  ) {
    throw new AppError(
      409,
      "VEHICLE_UNAVAILABLE",
      "Vehicle is not available for rental.",
    );
  }
}
