import { prisma } from "../../database";
import type { MaintenanceType } from "./maintenance.types";
import type {
  MaintenanceScheduleRecord,
  MaintenanceScheduleType,
} from "./maintenance-schedule.types";

async function findByOrganization(
  organizationId: string,
  vehicleId?: string,
): Promise<MaintenanceScheduleRecord[]> {
  return prisma.maintenanceSchedule.findMany({
    where: {
      organization_id: organizationId,
      deleted_at: null,
      ...(vehicleId ? { vehicle_id: vehicleId } : {}),
    },
    orderBy: [{ is_active: "desc" }, { next_due_date: "asc" }],
  });
}

async function findById(
  id: string,
  organizationId: string,
): Promise<MaintenanceScheduleRecord | null> {
  return prisma.maintenanceSchedule.findFirst({
    where: { id, organization_id: organizationId, deleted_at: null },
  });
}

async function findVehicle(
  vehicleId: string,
  organizationId: string,
): Promise<{ id: string } | null> {
  return prisma.vehicle.findFirst({
    where: { id: vehicleId, organization_id: organizationId, deleted_at: null },
    select: { id: true },
  });
}

async function create(data: {
  organization_id: string;
  vehicle_id: string;
  maintenance_type: MaintenanceType;
  schedule_type: MaintenanceScheduleType;
  date_interval_days: number | null;
  next_due_date: Date | null;
  mileage_interval: number | null;
  next_due_mileage: number | null;
  is_active: boolean;
}): Promise<MaintenanceScheduleRecord> {
  return prisma.maintenanceSchedule.create({ data });
}

async function update(
  id: string,
  data: {
    maintenance_type: MaintenanceType;
    schedule_type: MaintenanceScheduleType;
    date_interval_days: number | null;
    next_due_date: Date | null;
    mileage_interval: number | null;
    next_due_mileage: number | null;
    is_active: boolean;
  },
): Promise<MaintenanceScheduleRecord> {
  return prisma.maintenanceSchedule.update({ where: { id }, data });
}

async function softDelete(id: string): Promise<void> {
  await prisma.maintenanceSchedule.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}

export { findByOrganization, findById, findVehicle, create, update, softDelete };
