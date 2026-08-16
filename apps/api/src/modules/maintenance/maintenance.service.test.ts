import { describe, it, expect, beforeEach } from "vitest";
import {
  listMaintenance,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  completeMaintenance,
  listVehicleMaintenance,
  deleteMaintenance,
} from "./maintenance.service";
import { cleanup, seed, type SeedOrg } from "../../test/helpers";

describe("maintenance service", () => {
  let ctx: SeedOrg;

  beforeEach(async () => {
    await cleanup();
    ctx = await seed();
  });

  describe("create", () => {
    it("creates a maintenance record for a vehicle in the organization", async () => {
      const record = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "PREVENTIVE_SERVICE",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      expect(record.vehicleId).toBe(ctx.vehicleId);
      expect(record.type).toBe("PREVENTIVE_SERVICE");
      expect(record.status).toBe("SCHEDULED");
      expect(record.cost).toBeNull();
      expect(record.completedAt).toBeNull();
    });

    it("rejects creating maintenance for a vehicle in another organization", async () => {
      await expect(
        createMaintenance(ctx.otherOrgId, {
          vehicle_id: ctx.vehicleId,
          type: "REPAIR",
          maintenance_date: new Date("2026-08-20T09:00:00Z"),
        }),
      ).rejects.toThrow("Vehicle not found");
    });

    it("rejects a missing vehicle", async () => {
      await expect(
        createMaintenance(ctx.orgId, {
          vehicle_id: "00000000-0000-0000-0000-000000000000",
          type: "REPAIR",
          maintenance_date: new Date("2026-08-20T09:00:00Z"),
        }),
      ).rejects.toThrow("Vehicle not found");
    });

    it("always creates a record as SCHEDULED regardless of provided fields", async () => {
      const record = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      expect(record.status).toBe("SCHEDULED");
      expect(record.completedAt).toBeNull();
      expect(record.cost).toBeNull();
    });

    it("cannot create a record with a completed lifecycle state", async () => {
      const record = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      expect(record.status).not.toBe("COMPLETED");
      expect(record.status).toBe("SCHEDULED");
    });

    it("cannot bypass the completion workflow through create even with a cost", async () => {
      const record = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
        cost: 100,
      });

      expect(record.status).toBe("SCHEDULED");
      expect(record.completedAt).toBeNull();
      expect(record.cost).toBe(100);
    });

    it("rejects a negative cost", async () => {
      await expect(
        createMaintenance(ctx.orgId, {
          vehicle_id: ctx.vehicleId,
          type: "REPAIR",
          maintenance_date: new Date("2026-08-20T09:00:00Z"),
          cost: -5,
        }),
      ).rejects.toThrow("non-negative");
    });

    it("rejects replaced parts with an empty name", async () => {
      await expect(
        createMaintenance(ctx.orgId, {
          vehicle_id: ctx.vehicleId,
          type: "REPAIR",
          maintenance_date: new Date("2026-08-20T09:00:00Z"),
          replaced_parts: [{ name: "  " }],
        }),
      ).rejects.toThrow("Replaced part name is required");
    });

    it("rejects replaced parts with a zero quantity", async () => {
      await expect(
        createMaintenance(ctx.orgId, {
          vehicle_id: ctx.vehicleId,
          type: "REPAIR",
          maintenance_date: new Date("2026-08-20T09:00:00Z"),
          replaced_parts: [{ name: "Brake pad", quantity: 0 }],
        }),
      ).rejects.toThrow("positive integer");
    });

    it("rejects replaced parts with a negative unit cost", async () => {
      await expect(
        createMaintenance(ctx.orgId, {
          vehicle_id: ctx.vehicleId,
          type: "REPAIR",
          maintenance_date: new Date("2026-08-20T09:00:00Z"),
          replaced_parts: [{ name: "Brake pad", unitCost: -1 }],
        }),
      ).rejects.toThrow("non-negative");
    });
  });

  describe("get", () => {
    it("returns a maintenance record in the organization", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "INSPECTION",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      const record = await getMaintenance(created.id, ctx.orgId);
      expect(record.id).toBe(created.id);
      expect(record.type).toBe("INSPECTION");
    });

    it("does not expose a maintenance record to another organization", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "INSPECTION",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      await expect(
        getMaintenance(created.id, ctx.otherOrgId),
      ).rejects.toThrow("not found");
    });

    it("returns 404 for a missing record", async () => {
      await expect(
        getMaintenance(
          "00000000-0000-0000-0000-000000000000",
          ctx.orgId,
        ),
      ).rejects.toThrow("not found");
    });
  });

  describe("update", () => {
    it("moves a scheduled record to in progress", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      const updated = await updateMaintenance(created.id, ctx.orgId, {
        status: "IN_PROGRESS",
      });

      expect(updated.status).toBe("IN_PROGRESS");
    });

    it("does not allow completing through the update operation", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      await expect(
        updateMaintenance(created.id, ctx.orgId, {
          status: "COMPLETED",
        }),
      ).rejects.toThrow("through the complete operation");
    });

    it("rejects a backward transition from in progress to scheduled", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      await updateMaintenance(created.id, ctx.orgId, {
        status: "IN_PROGRESS",
      });

      await expect(
        updateMaintenance(created.id, ctx.orgId, {
          status: "SCHEDULED",
        }),
      ).rejects.toThrow("Invalid maintenance status transition");
    });

    it("does not allow updating a record in another organization", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      await expect(
        updateMaintenance(created.id, ctx.otherOrgId, {
          notes: "hacked",
        }),
      ).rejects.toThrow("not found");
    });

    it("does not allow updating a completed record", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      await completeMaintenance(created.id, ctx.orgId, { cost: 100 });

      await expect(
        updateMaintenance(created.id, ctx.orgId, {
          notes: "changed after completion",
        }),
      ).rejects.toThrow("cannot be updated");
    });
  });

  describe("complete", () => {
    it("completes a scheduled record and sets status, completed_at, and cost", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      const completed = await completeMaintenance(created.id, ctx.orgId, {
        cost: 150,
      });

      expect(completed.status).toBe("COMPLETED");
      expect(completed.completedAt).not.toBeNull();
      expect(completed.cost).toBe(150);
      expect(completed.maintenanceDate).toBe("2026-08-20T09:00:00.000Z");
    });

    it("requires a non-negative cost", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      await expect(
        completeMaintenance(created.id, ctx.orgId, { cost: -1 }),
      ).rejects.toThrow("non-negative");
    });

    it("allows a zero cost", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      const completed = await completeMaintenance(created.id, ctx.orgId, {
        cost: 0,
      });

      expect(completed.cost).toBe(0);
      expect(completed.status).toBe("COMPLETED");
    });

    it("rejects completing a record in another organization", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      await expect(
        completeMaintenance(created.id, ctx.otherOrgId, { cost: 100 }),
      ).rejects.toThrow("not found");
    });

    it("rejects completing an already completed record", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      await completeMaintenance(created.id, ctx.orgId, { cost: 100 });

      await expect(
        completeMaintenance(created.id, ctx.orgId, { cost: 200 }),
      ).rejects.toThrow("already completed");
    });
  });

  describe("list", () => {
    it("lists maintenance records for the organization only", async () => {
      await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });
      await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.otherVehicleId,
        type: "INSPECTION",
        maintenance_date: new Date("2026-08-21T09:00:00Z"),
      });
      await createMaintenance(ctx.otherOrgId, {
        vehicle_id: ctx.otherOrgVehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-22T09:00:00Z"),
      });

      const records = await listMaintenance(ctx.orgId);
      expect(records).toHaveLength(2);
    });

    it("filters by vehicle", async () => {
      await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });
      await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.otherVehicleId,
        type: "INSPECTION",
        maintenance_date: new Date("2026-08-21T09:00:00Z"),
      });

      const records = await listMaintenance(ctx.orgId, ctx.vehicleId);
      expect(records).toHaveLength(1);
      expect(records[0].vehicleId).toBe(ctx.vehicleId);
    });
  });

  describe("vehicle history", () => {
    it("returns maintenance history for a vehicle", async () => {
      await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });
      await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "INSPECTION",
        maintenance_date: new Date("2026-08-21T09:00:00Z"),
      });
      await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.otherVehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-22T09:00:00Z"),
      });

      const history = await listVehicleMaintenance(ctx.vehicleId, ctx.orgId);
      expect(history).toHaveLength(2);
    });

    it("rejects vehicle history for a vehicle in another organization", async () => {
      await expect(
        listVehicleMaintenance(ctx.vehicleId, ctx.otherOrgId),
      ).rejects.toThrow("Vehicle not found");
    });

    it("returns 404 for an unknown vehicle", async () => {
      await expect(
        listVehicleMaintenance(
          "00000000-0000-0000-0000-000000000000",
          ctx.orgId,
        ),
      ).rejects.toThrow("Vehicle not found");
    });
  });

  describe("soft delete", () => {
    it("soft deletes a maintenance record", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      await deleteMaintenance(created.id, ctx.orgId);

      await expect(
        getMaintenance(created.id, ctx.orgId),
      ).rejects.toThrow("not found");
    });

    it("rejects deleting a record in another organization", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });

      await expect(
        deleteMaintenance(created.id, ctx.otherOrgId),
      ).rejects.toThrow("not found");
    });

    it("excludes soft-deleted records from list and vehicle history", async () => {
      const created = await createMaintenance(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        type: "REPAIR",
        maintenance_date: new Date("2026-08-20T09:00:00Z"),
      });
      await deleteMaintenance(created.id, ctx.orgId);

      const all = await listMaintenance(ctx.orgId);
      const history = await listVehicleMaintenance(ctx.vehicleId, ctx.orgId);

      expect(all).toHaveLength(0);
      expect(history).toHaveLength(0);
    });
  });
});
