import { prisma } from "../../database";
import type { VehicleRecord } from "./vehicle.types";

async function findByOrg(orgId: string): Promise<VehicleRecord[]> {
  return prisma.vehicle.findMany({
    where: { organization_id: orgId, deleted_at: null },
    orderBy: { created_at: "desc" },
  });
}

async function findById(vehicleId: string, orgId: string): Promise<VehicleRecord | null> {
  return prisma.vehicle.findFirst({
    where: { id: vehicleId, organization_id: orgId },
  });
}

async function create(data: {
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
}, orgId: string): Promise<VehicleRecord> {
  return prisma.vehicle.create({
    data: {
      ...data,
      organization_id: orgId,
    },
  });
}

async function update(vehicleId: string, data: {
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
}): Promise<VehicleRecord> {
  return prisma.vehicle.update({
    where: { id: vehicleId },
    data,
  });
}

async function softDelete(vehicleId: string): Promise<VehicleRecord> {
  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: { deleted_at: new Date() },
  });
}

export { findByOrg, findById, create, update, softDelete };
