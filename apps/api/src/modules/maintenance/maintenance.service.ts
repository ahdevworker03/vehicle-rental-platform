import { AppError } from "../../shared";
import { transaction, retrySerializable } from "../../database";
import * as repo from "./maintenance.repository";
import type {
  MaintenanceResponse,
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  CompleteMaintenanceInput,
  MaintenanceRecord,
  MaintenanceStatus,
  MaintenanceReplacedPart,
} from "./maintenance.types";

function toResponse(record: MaintenanceRecord): MaintenanceResponse {
  return {
    id: record.id,
    vehicleId: record.vehicle_id,
    type: record.type,
    status: record.status,
    maintenanceDate: record.maintenance_date.toISOString(),
    completedAt: record.completed_at ? record.completed_at.toISOString() : null,
    cost: record.cost === null ? null : Number(record.cost.toString()),
    vendor: record.vendor,
    notes: record.notes,
    replacedParts: record.replaced_parts
      ? (record.replaced_parts as MaintenanceReplacedPart[])
      : null,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

function isCompleted(status: MaintenanceStatus): boolean {
  return status === "COMPLETED";
}

function assertValidLifecycleTransition(
  current: MaintenanceStatus,
  next: MaintenanceStatus,
): void {
  if (current === next) {
    return;
  }

  const valid: Record<MaintenanceStatus, MaintenanceStatus[]> = {
    SCHEDULED: ["IN_PROGRESS", "COMPLETED"],
    IN_PROGRESS: ["COMPLETED"],
    COMPLETED: [],
  };

  if (!valid[current].includes(next)) {
    throw new AppError(
      409,
      "INVALID_MAINTENANCE_TRANSITION",
      `Invalid maintenance status transition from ${current} to ${next}.`,
    );
  }
}

function assertReplacedPartsValid(parts: MaintenanceReplacedPart[]): void {
  for (const part of parts) {
    if (typeof part.name !== "string" || part.name.trim() === "") {
      throw new AppError(
        422,
        "INVALID_REPLACED_PART",
        "Replaced part name is required and must be non-empty.",
      );
    }
    if (part.quantity !== undefined && part.quantity <= 0) {
      throw new AppError(
        422,
        "INVALID_REPLACED_PART",
        "Replaced part quantity must be a positive integer.",
      );
    }
    if (part.unitCost !== undefined && part.unitCost < 0) {
      throw new AppError(
        422,
        "INVALID_REPLACED_PART",
        "Replaced part unit cost must be non-negative.",
      );
    }
  }
}

function assertCostValid(cost: number): void {
  if (!Number.isFinite(cost) || cost < 0) {
    throw new AppError(
      422,
      "INVALID_MAINTENANCE_COST",
      "Maintenance cost must be a non-negative number.",
    );
  }
}

function assertVehicleCanEnterMaintenance(
  vehicleStatus: string,
  liveRentals: { status: string }[],
): void {
  if (
    liveRentals.length > 0 ||
    vehicleStatus === "OUT_OF_SERVICE" ||
    vehicleStatus === "ARCHIVED"
  ) {
    throw new AppError(
      409,
      "VEHICLE_UNAVAILABLE",
      "Vehicle cannot enter maintenance while a live rental or non-operational status blocks it.",
    );
  }
}

async function synchronizeVehicleAvailability(
  vehicleId: string,
  orgId: string,
  currentVehicleStatus: string,
  tx: Parameters<typeof repo.findVehicleWithinTx>[2],
): Promise<void> {
  const [inProgressMaintenance, liveRentals] = await Promise.all([
    repo.findInProgressByVehicleWithinTx(vehicleId, orgId, tx),
    repo.findLiveRentalsByVehicleWithinTx(vehicleId, orgId, tx),
  ]);

  if (liveRentals.some((rental) => rental.status === "ACTIVE")) {
    await repo.updateVehicleStatusWithinTx(vehicleId, "RENTED", tx);
    return;
  }

  if (inProgressMaintenance.length > 0) {
    if (
      currentVehicleStatus !== "OUT_OF_SERVICE" &&
      currentVehicleStatus !== "ARCHIVED"
    ) {
      await repo.updateVehicleStatusWithinTx(vehicleId, "MAINTENANCE", tx);
    }
    return;
  }

  if (liveRentals.some((rental) => rental.status === "RESERVED")) {
    await repo.updateVehicleStatusWithinTx(vehicleId, "RESERVED", tx);
    return;
  }

  if (currentVehicleStatus === "MAINTENANCE") {
    await repo.updateVehicleStatusWithinTx(vehicleId, "AVAILABLE", tx);
  }
}

async function listMaintenance(
  orgId: string,
  vehicleId?: string,
): Promise<MaintenanceResponse[]> {
  const records = await repo.findByOrg(orgId, vehicleId);
  return records.map(toResponse);
}

async function getMaintenance(
  maintenanceId: string,
  orgId: string,
): Promise<MaintenanceResponse> {
  const record = await repo.findById(maintenanceId, orgId);

  if (!record || record.deleted_at) {
    throw new AppError(
      404,
      "MAINTENANCE_NOT_FOUND",
      "Maintenance record not found.",
    );
  }

  return toResponse(record);
}

async function createMaintenance(
  orgId: string,
  input: CreateMaintenanceInput,
): Promise<MaintenanceResponse> {
  const vehicle = await repo.findVehicle(input.vehicle_id, orgId);

  if (!vehicle) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
  }

  if (input.replaced_parts) {
    assertReplacedPartsValid(input.replaced_parts);
  }
  if (input.cost !== undefined) {
    assertCostValid(input.cost);
  }

  const record = await repo.create({
    organization_id: orgId,
    vehicle_id: input.vehicle_id,
    type: input.type,
    status: "SCHEDULED",
    maintenance_date: input.maintenance_date,
    cost: input.cost ?? null,
    vendor: input.vendor ?? null,
    notes: input.notes ?? null,
    replaced_parts: input.replaced_parts ?? null,
  });

  return toResponse(record);
}

async function updateMaintenance(
  maintenanceId: string,
  orgId: string,
  input: UpdateMaintenanceInput,
): Promise<MaintenanceResponse> {
  if (input.replaced_parts) {
    assertReplacedPartsValid(input.replaced_parts);
  }
  if (input.cost !== undefined && input.cost !== null) {
    assertCostValid(input.cost);
  }

  const run = () =>
    transaction(
      async (tx) => {
        const record = await repo.findByIdWithinTx(maintenanceId, orgId, tx);

        if (!record || record.deleted_at) {
          throw new AppError(
            404,
            "MAINTENANCE_NOT_FOUND",
            "Maintenance record not found.",
          );
        }

        if (isCompleted(record.status)) {
          throw new AppError(
            409,
            "INVALID_MAINTENANCE_TRANSITION",
            "A completed maintenance record cannot be updated.",
          );
        }

        const nextStatus = input.status ?? record.status;
        assertValidLifecycleTransition(record.status, nextStatus);

        if (nextStatus === "COMPLETED") {
          throw new AppError(
            409,
            "INVALID_MAINTENANCE_TRANSITION",
            "Completion must be performed through the complete operation.",
          );
        }

        if (nextStatus === "IN_PROGRESS") {
          const vehicle = await repo.findVehicleWithinTx(
            record.vehicle_id,
            orgId,
            tx,
          );

          if (!vehicle) {
            throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
          }

          const liveRentals = await repo.findLiveRentalsByVehicleWithinTx(
            record.vehicle_id,
            orgId,
            tx,
          );
          assertVehicleCanEnterMaintenance(vehicle.status, liveRentals);
        }

        const updated = await repo.updateWithinTx(
          maintenanceId,
          {
            ...(input.type !== undefined ? { type: input.type } : {}),
            ...(input.status !== undefined ? { status: nextStatus } : {}),
            ...(input.maintenance_date !== undefined
              ? { maintenance_date: input.maintenance_date }
              : {}),
            ...(input.cost !== undefined ? { cost: input.cost } : {}),
            ...(input.vendor !== undefined ? { vendor: input.vendor } : {}),
            ...(input.notes !== undefined ? { notes: input.notes } : {}),
            ...(input.replaced_parts !== undefined
              ? { replaced_parts: input.replaced_parts }
              : {}),
          },
          tx,
        );

        if (nextStatus === "IN_PROGRESS") {
          await repo.updateVehicleStatusWithinTx(record.vehicle_id, "MAINTENANCE", tx);
        }

        return updated;
      },
      { isolationLevel: "Serializable" },
    );

  const updated = await retrySerializable(run);

  return toResponse(updated);
}

async function completeMaintenance(
  maintenanceId: string,
  orgId: string,
  input: CompleteMaintenanceInput,
): Promise<MaintenanceResponse> {
  assertCostValid(input.cost);

  const run = () => transaction(async (tx) => {
    const current = await repo.findByIdWithinTx(maintenanceId, orgId, tx);

    if (!current || current.deleted_at) {
      throw new AppError(
        404,
        "MAINTENANCE_NOT_FOUND",
        "Maintenance record not found.",
      );
    }

    if (isCompleted(current.status)) {
      throw new AppError(
        409,
        "INVALID_MAINTENANCE_TRANSITION",
        "This maintenance record is already completed.",
      );
    }

    assertValidLifecycleTransition(current.status, "COMPLETED");

    const updated = await repo.updateWithinTx(
      maintenanceId,
      {
        status: "COMPLETED",
        completed_at: new Date(),
        cost: input.cost,
      },
      tx,
    );

    const vehicle = await repo.findVehicleWithinTx(
      current.vehicle_id,
      orgId,
      tx,
    );
    if (vehicle) {
      await synchronizeVehicleAvailability(
        current.vehicle_id,
        orgId,
        vehicle.status,
        tx,
      );
    }

    return updated;
  }, { isolationLevel: "Serializable" });

  const record = await retrySerializable(run);

  return toResponse(record);
}

async function listVehicleMaintenance(
  vehicleId: string,
  orgId: string,
): Promise<MaintenanceResponse[]> {
  const vehicle = await repo.findVehicle(vehicleId, orgId);

  if (!vehicle) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
  }

  const records = await repo.findByVehicle(vehicleId, orgId);
  return records.map(toResponse);
}

async function deleteMaintenance(
  maintenanceId: string,
  orgId: string,
): Promise<void> {
  const run = () =>
    transaction(
      async (tx) => {
        const record = await repo.findByIdWithinTx(maintenanceId, orgId, tx);

        if (!record || record.deleted_at) {
          throw new AppError(
            404,
            "MAINTENANCE_NOT_FOUND",
            "Maintenance record not found.",
          );
        }

        await repo.softDeleteWithinTx(maintenanceId, tx);

        const vehicle = await repo.findVehicleWithinTx(
          record.vehicle_id,
          orgId,
          tx,
        );
        if (vehicle) {
          await synchronizeVehicleAvailability(
            record.vehicle_id,
            orgId,
            vehicle.status,
            tx,
          );
        }
      },
      { isolationLevel: "Serializable" },
    );

  await retrySerializable(run);
}

export {
  listMaintenance,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  completeMaintenance,
  listVehicleMaintenance,
  deleteMaintenance,
};
