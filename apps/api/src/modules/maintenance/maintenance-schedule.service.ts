import { AppError } from "../../shared";
import * as repository from "./maintenance-schedule.repository";
import type {
  CreateMaintenanceScheduleInput,
  MaintenanceScheduleRecord,
  MaintenanceScheduleResponse,
  MaintenanceScheduleType,
  UpdateMaintenanceScheduleInput,
} from "./maintenance-schedule.types";

function toBusinessDate(value: string | null | undefined): Date | null {
  if (value === undefined || value === null) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new AppError(
      422,
      "INVALID_MAINTENANCE_SCHEDULE",
      "next_due_date must be a valid YYYY-MM-DD business date.",
    );
  }
  return date;
}

function toResponse(record: MaintenanceScheduleRecord): MaintenanceScheduleResponse {
  return {
    id: record.id,
    vehicleId: record.vehicle_id,
    maintenanceType: record.maintenance_type,
    scheduleType: record.schedule_type,
    dateIntervalDays: record.date_interval_days,
    nextDueDate: record.next_due_date?.toISOString().slice(0, 10) ?? null,
    mileageInterval: record.mileage_interval,
    nextDueMileage: record.next_due_mileage,
    isActive: record.is_active,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

function scheduleError(message: string): never {
  throw new AppError(422, "INVALID_MAINTENANCE_SCHEDULE", message);
}

function assertScheduleBasis(config: {
  scheduleType: MaintenanceScheduleType;
  dateIntervalDays: number | null;
  nextDueDate: Date | null;
  mileageInterval: number | null;
  nextDueMileage: number | null;
}): void {
  const dateConfigured =
    Number.isInteger(config.dateIntervalDays) &&
    config.dateIntervalDays! > 0 &&
    config.nextDueDate !== null;
  const mileageConfigured =
    Number.isInteger(config.mileageInterval) &&
    config.mileageInterval! > 0 &&
    Number.isInteger(config.nextDueMileage) &&
    config.nextDueMileage! >= 0;

  if (config.scheduleType === "DATE") {
    if (!dateConfigured || config.mileageInterval !== null || config.nextDueMileage !== null) {
      scheduleError(
        "DATE schedules require date_interval_days and next_due_date only.",
      );
    }
    return;
  }

  if (config.scheduleType === "MILEAGE") {
    if (!mileageConfigured || config.dateIntervalDays !== null || config.nextDueDate !== null) {
      scheduleError(
        "MILEAGE schedules require mileage_interval and next_due_mileage only.",
      );
    }
    return;
  }

  if (!dateConfigured || !mileageConfigured) {
    scheduleError(
      "DATE_OR_MILEAGE schedules require both date and mileage schedule values.",
    );
  }
}

function notFound(): never {
  throw new AppError(
    404,
    "MAINTENANCE_SCHEDULE_NOT_FOUND",
    "Maintenance schedule not found.",
  );
}

async function listMaintenanceSchedules(
  organizationId: string,
  vehicleId?: string,
): Promise<MaintenanceScheduleResponse[]> {
  const schedules = await repository.findByOrganization(organizationId, vehicleId);
  return schedules.map(toResponse);
}

async function getMaintenanceSchedule(
  id: string,
  organizationId: string,
): Promise<MaintenanceScheduleResponse> {
  const schedule = await repository.findById(id, organizationId);
  if (!schedule) notFound();
  return toResponse(schedule);
}

async function createMaintenanceSchedule(
  organizationId: string,
  input: CreateMaintenanceScheduleInput,
): Promise<MaintenanceScheduleResponse> {
  const vehicle = await repository.findVehicle(input.vehicle_id, organizationId);
  if (!vehicle) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
  }

  const config = {
    scheduleType: input.schedule_type,
    dateIntervalDays: input.date_interval_days ?? null,
    nextDueDate: toBusinessDate(input.next_due_date),
    mileageInterval: input.mileage_interval ?? null,
    nextDueMileage: input.next_due_mileage ?? null,
  };
  assertScheduleBasis(config);

  const schedule = await repository.create({
    organization_id: organizationId,
    vehicle_id: vehicle.id,
    maintenance_type: input.maintenance_type,
    schedule_type: config.scheduleType,
    date_interval_days: config.dateIntervalDays,
    next_due_date: config.nextDueDate,
    mileage_interval: config.mileageInterval,
    next_due_mileage: config.nextDueMileage,
    is_active: input.is_active ?? true,
  });
  return toResponse(schedule);
}

async function updateMaintenanceSchedule(
  id: string,
  organizationId: string,
  input: UpdateMaintenanceScheduleInput,
): Promise<MaintenanceScheduleResponse> {
  const current = await repository.findById(id, organizationId);
  if (!current) notFound();

  const config = {
    scheduleType: input.schedule_type ?? current.schedule_type,
    dateIntervalDays:
      input.date_interval_days === undefined
        ? current.date_interval_days
        : input.date_interval_days,
    nextDueDate:
      input.next_due_date === undefined
        ? current.next_due_date
        : toBusinessDate(input.next_due_date),
    mileageInterval:
      input.mileage_interval === undefined
        ? current.mileage_interval
        : input.mileage_interval,
    nextDueMileage:
      input.next_due_mileage === undefined
        ? current.next_due_mileage
        : input.next_due_mileage,
  };
  assertScheduleBasis(config);

  const schedule = await repository.update(id, {
    maintenance_type: input.maintenance_type ?? current.maintenance_type,
    schedule_type: config.scheduleType,
    date_interval_days: config.dateIntervalDays,
    next_due_date: config.nextDueDate,
    mileage_interval: config.mileageInterval,
    next_due_mileage: config.nextDueMileage,
    is_active: input.is_active ?? current.is_active,
  });
  return toResponse(schedule);
}

async function deleteMaintenanceSchedule(
  id: string,
  organizationId: string,
): Promise<void> {
  const schedule = await repository.findById(id, organizationId);
  if (!schedule) notFound();
  await repository.softDelete(schedule.id);
}

export {
  listMaintenanceSchedules,
  getMaintenanceSchedule,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  deleteMaintenanceSchedule,
};
