import {
  CreateRentalBody,
  UpdateRentalBody,
  ListRentalsQueryParams,
} from "@workspace/api-zod";
import type { CreateRentalInput, UpdateRentalInput } from "./rental.types";

export const createRentalSchema = CreateRentalBody;
export const updateRentalSchema = UpdateRentalBody;
export const listRentalsQuerySchema = ListRentalsQueryParams;

export type ListRentalsQuery = { search?: string };

export type { CreateRentalInput, UpdateRentalInput };
