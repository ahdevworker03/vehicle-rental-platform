export interface VehicleRecord {
  id: string;
  organization_id: string;
  make: string;
  model: string;
  plate_number: string;
  year: number;
  color: string;
  vin: string | null;
  engine_number: string | null;
  transmission: "MANUAL" | "AUTOMATIC";
  fuel_type: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
  seats: number;
  current_mileage: number;
  status: "AVAILABLE" | "RESERVED" | "RENTED" | "MAINTENANCE" | "OUT_OF_SERVICE" | "ARCHIVED";
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface VehicleResponse {
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

export interface CreateVehicleInput {
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
}

export interface UpdateVehicleInput {
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
}
