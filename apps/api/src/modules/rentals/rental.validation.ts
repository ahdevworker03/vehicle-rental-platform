import {
  CreateRentalBody,
  UpdateRentalBody,
  ListRentalsQueryParams,
  PickupRentalBody,
  ReturnRentalBody,
  ExtendRentalBody,
  CheckRentalAvailabilityQueryParams,
} from "@workspace/api-zod";
import type { CreateRentalInput, UpdateRentalInput } from "./rental.types";

export const createRentalSchema = CreateRentalBody;
export const updateRentalSchema = UpdateRentalBody;
export const listRentalsQuerySchema = ListRentalsQueryParams;
export const pickupRentalSchema = PickupRentalBody;
export const returnRentalSchema = ReturnRentalBody;
export const extendRentalSchema = ExtendRentalBody;
export const checkAvailabilityQuerySchema = CheckRentalAvailabilityQueryParams;

export type ListRentalsQuery = { search?: string };

export type CheckAvailabilityQuery = {
  vehicleId: string;
  pickupDate: string;
  expectedReturnDate: string;
  excludeRentalId?: string;
};

export type { CreateRentalInput, UpdateRentalInput };
