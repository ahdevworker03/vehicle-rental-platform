import {
  CreateVehicleBody,
  UpdateVehicleBody,
  ListVehiclesQueryParams,
  ListAvailableVehiclesQueryParams,
} from "@workspace/api-zod";

export const createVehicleSchema = CreateVehicleBody;
export const updateVehicleSchema = UpdateVehicleBody;
export const listVehiclesQuerySchema = ListVehiclesQueryParams;
export const listAvailableVehiclesQuerySchema = ListAvailableVehiclesQueryParams;

export type CreateVehicleInput = {
  make: string;
  model: string;
  plate_number: string;
  year: number;
  color: string;
  vin?: string;
  engine_number?: string;
  transmission: "MANUAL" | "AUTOMATIC";
  fuel_type: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
  seats: number;
  current_mileage: number;
  status: "AVAILABLE" | "RESERVED" | "RENTED" | "MAINTENANCE" | "OUT_OF_SERVICE" | "ARCHIVED";
};

export type UpdateVehicleInput = {
  make: string;
  model: string;
  plate_number: string;
  year: number;
  color: string;
  vin?: string;
  engine_number?: string;
  transmission: "MANUAL" | "AUTOMATIC";
  fuel_type: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
  seats: number;
  current_mileage: number;
  status: "AVAILABLE" | "RESERVED" | "RENTED" | "MAINTENANCE" | "OUT_OF_SERVICE" | "ARCHIVED";
};

export type ListVehiclesQuery = { search?: string };

export type ListAvailableVehiclesQuery = {
  pickupDate: string;
  expectedReturnDate: string;
};
