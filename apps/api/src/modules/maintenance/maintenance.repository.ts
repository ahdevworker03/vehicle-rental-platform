import { prisma } from "../../database";
import type { TxClient } from "../../database";
import { Prisma } from "@prisma/client";
import type {
  MaintenanceRecord,
  MaintenanceType,
  MaintenanceStatus,
} from "./maintenance.types";

type DbClient = typeof prisma | TxClient;

async function findByOrg(
  orgId: string,
  vehicleId?: string,
): Promise<MaintenanceRecord[]> {
  return prisma.maintenance.findMany({
    where: {
      organization_id: orgId,
      deleted_at: null,
      ...(vehicleId ? { vehicle_id: vehicleId } : {}),
    },
    orderBy: { maintenance_date: "desc" },
  });
}

async function findById(
  maintenanceId: string,
  orgId: string,
): Promise<MaintenanceRecord | null> {
  return prisma.maintenance.findFirst({
    where: { id: maintenanceId, organization_id: orgId },
  });
}

async function findByIdWithinTx(
  maintenanceId: string,
  orgId: string,
  tx: DbClient,
): Promise<MaintenanceRecord | null> {
  return tx.maintenance.findFirst({
    where: { id: maintenanceId, organization_id: orgId },
  });
}

async function findByVehicle(
  vehicleId: string,
  orgId: string,
): Promise<MaintenanceRecord[]> {
  return prisma.maintenance.findMany({
    where: { vehicle_id: vehicleId, organization_id: orgId, deleted_at: null },
    orderBy: { maintenance_date: "desc" },
  });
}

async function findVehicle(
  vehicleId: string,
  orgId: string,
): Promise<{ id: string } | null> {
  return prisma.vehicle.findFirst({
    where: { id: vehicleId, organization_id: orgId, deleted_at: null },
    select: { id: true },
  });
}

async function findVehicleWithinTx(
  vehicleId: string,
  orgId: string,
  tx: DbClient,
): Promise<{ id: string; status: string } | null> {
  return tx.vehicle.findFirst({
    where: { id: vehicleId, organization_id: orgId, deleted_at: null },
    select: { id: true, status: true },
  });
}

async function create(data: {
  organization_id: string;
  vehicle_id: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  maintenance_date: Date;
  cost: number | null;
  vendor: string | null;
  notes: string | null;
  replaced_parts: unknown | null;
}): Promise<MaintenanceRecord> {
  return prisma.maintenance.create({
    data: {
      ...data,
      replaced_parts:
        data.replaced_parts === null
          ? Prisma.JsonNull
          : (data.replaced_parts as Prisma.InputJsonValue),
    },
  });
}

async function update(
  maintenanceId: string,
  data: {
    type?: MaintenanceType;
    status?: MaintenanceStatus;
    maintenance_date?: Date;
    completed_at?: Date | null;
    cost?: number | null;
    vendor?: string | null;
    notes?: string | null;
    replaced_parts?: unknown | null;
  },
): Promise<MaintenanceRecord> {
  const { replaced_parts, ...rest } = data;

  return prisma.maintenance.update({
    where: { id: maintenanceId },
    data: {
      ...rest,
      ...(replaced_parts === undefined
        ? {}
        : {
            replaced_parts:
              replaced_parts === null
                ? Prisma.JsonNull
                : (replaced_parts as Prisma.InputJsonValue),
          }),
    },
  });
}

async function updateWithinTx(
  maintenanceId: string,
  data: {
    type?: MaintenanceType;
    status?: MaintenanceStatus;
    maintenance_date?: Date;
    completed_at?: Date | null;
    cost?: number | null;
    vendor?: string | null;
    notes?: string | null;
    replaced_parts?: unknown | null;
  },
  tx: DbClient,
): Promise<MaintenanceRecord> {
  const { replaced_parts, ...rest } = data;

  return tx.maintenance.update({
    where: { id: maintenanceId },
    data: {
      ...rest,
      ...(replaced_parts === undefined
        ? {}
        : {
            replaced_parts:
              replaced_parts === null
                ? Prisma.JsonNull
                : (replaced_parts as Prisma.InputJsonValue),
          }),
    },
  });
}

async function softDeleteWithinTx(
  maintenanceId: string,
  tx: DbClient,
): Promise<MaintenanceRecord> {
  return tx.maintenance.update({
    where: { id: maintenanceId },
    data: { deleted_at: new Date() },
  });
}

async function findInProgressByVehicleWithinTx(
  vehicleId: string,
  orgId: string,
  tx: DbClient,
): Promise<Pick<MaintenanceRecord, "id">[]> {
  return tx.maintenance.findMany({
    where: {
      vehicle_id: vehicleId,
      organization_id: orgId,
      status: "IN_PROGRESS",
      deleted_at: null,
    },
    select: { id: true },
  });
}

async function findLiveRentalsByVehicleWithinTx(
  vehicleId: string,
  orgId: string,
  tx: DbClient,
): Promise<{ status: string }[]> {
  return tx.rental.findMany({
    where: {
      vehicle_id: vehicleId,
      organization_id: orgId,
      deleted_at: null,
      status: { in: ["RESERVED", "ACTIVE"] },
    },
    select: { status: true },
  });
}

async function updateVehicleStatusWithinTx(
  vehicleId: string,
  status: "AVAILABLE" | "RESERVED" | "RENTED" | "MAINTENANCE",
  tx: DbClient,
): Promise<void> {
  await tx.vehicle.update({
    where: { id: vehicleId },
    data: { status },
  });
}

export {
  findByOrg,
  findById,
  findByIdWithinTx,
  findByVehicle,
  findVehicle,
  findVehicleWithinTx,
  create,
  update,
  updateWithinTx,
  softDeleteWithinTx,
  findInProgressByVehicleWithinTx,
  findLiveRentalsByVehicleWithinTx,
  updateVehicleStatusWithinTx,
};
