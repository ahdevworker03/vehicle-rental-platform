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
): Promise<{ id: string } | null> {
  return tx.vehicle.findFirst({
    where: { id: vehicleId, organization_id: orgId, deleted_at: null },
    select: { id: true },
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
    status?: MaintenanceStatus;
    completed_at?: Date | null;
    cost?: number | null;
  },
  tx: DbClient,
): Promise<MaintenanceRecord> {
  return tx.maintenance.update({
    where: { id: maintenanceId },
    data,
  });
}

async function softDelete(maintenanceId: string): Promise<MaintenanceRecord> {
  return prisma.maintenance.update({
    where: { id: maintenanceId },
    data: { deleted_at: new Date() },
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
  softDelete,
};
