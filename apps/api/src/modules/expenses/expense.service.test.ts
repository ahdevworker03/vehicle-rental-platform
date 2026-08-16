import { describe, it, expect, beforeEach } from "vitest";
import {
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from "./expense.service";
import { cleanup, seed, type SeedOrg } from "../../test/helpers";

describe("expense service", () => {
  let ctx: SeedOrg;

  beforeEach(async () => {
    await cleanup();
    ctx = await seed();
  });

  describe("create", () => {
    it("creates an organization-level expense", async () => {
      const expense = await createExpense(ctx.orgId, {
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });

      expect(expense.category).toBe("FUEL");
      expect(expense.amount).toBe(50);
      expect(expense.vehicleId).toBeNull();
      expect(expense.description).toBeNull();
    });

    it("creates a vehicle-specific expense", async () => {
      const expense = await createExpense(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        category: "CLEANING",
        amount: 20,
        expense_date: new Date("2026-08-20T09:00:00Z"),
        description: "غسيل السيارة",
      });

      expect(expense.vehicleId).toBe(ctx.vehicleId);
      expect(expense.description).toBe("غسيل السيارة");
    });

    it("allows a zero amount", async () => {
      const expense = await createExpense(ctx.orgId, {
        category: "OTHER",
        amount: 0,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });

      expect(expense.amount).toBe(0);
    });

    it("rejects a negative amount", async () => {
      await expect(
        createExpense(ctx.orgId, {
          category: "FUEL",
          amount: -5,
          expense_date: new Date("2026-08-20T09:00:00Z"),
        }),
      ).rejects.toThrow("non-negative");
    });

    it("rejects an invalid category", async () => {
      await expect(
        createExpense(ctx.orgId, {
          category: "MAINTENANCE" as never,
          amount: 50,
          expense_date: new Date("2026-08-20T09:00:00Z"),
        }),
      ).rejects.toThrow("Invalid expense category");
    });

    it("rejects a vehicle that belongs to another organization", async () => {
      await expect(
        createExpense(ctx.orgId, {
          vehicle_id: ctx.otherOrgVehicleId,
          category: "FUEL",
          amount: 50,
          expense_date: new Date("2026-08-20T09:00:00Z"),
        }),
      ).rejects.toThrow("Vehicle not found");
    });

    it("rejects a missing vehicle", async () => {
      await expect(
        createExpense(ctx.orgId, {
          vehicle_id: "00000000-0000-0000-0000-000000000000",
          category: "FUEL",
          amount: 50,
          expense_date: new Date("2026-08-20T09:00:00Z"),
        }),
      ).rejects.toThrow("Vehicle not found");
    });
  });

  describe("get", () => {
    it("returns an expense in the organization", async () => {
      const created = await createExpense(ctx.orgId, {
        category: "INSURANCE",
        amount: 200,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });

      const expense = await getExpense(created.id, ctx.orgId);
      expect(expense.id).toBe(created.id);
      expect(expense.category).toBe("INSURANCE");
    });

    it("does not expose another organization's expense", async () => {
      const created = await createExpense(ctx.orgId, {
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });

      await expect(
        getExpense(created.id, ctx.otherOrgId),
      ).rejects.toThrow("not found");
    });

    it("returns 404 for a missing expense", async () => {
      await expect(
        getExpense("00000000-0000-0000-0000-000000000000", ctx.orgId),
      ).rejects.toThrow("not found");
    });
  });

  describe("update", () => {
    it("updates amount and category", async () => {
      const created = await createExpense(ctx.orgId, {
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });

      const updated = await updateExpense(created.id, ctx.orgId, {
        amount: 75,
        category: "CLEANING",
      });

      expect(updated.amount).toBe(75);
      expect(updated.category).toBe("CLEANING");
    });

    it("associates a vehicle with an organization-level expense", async () => {
      const created = await createExpense(ctx.orgId, {
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });

      const updated = await updateExpense(created.id, ctx.orgId, {
        vehicle_id: ctx.vehicleId,
      });

      expect(updated.vehicleId).toBe(ctx.vehicleId);
    });

    it("clears the vehicle association when vehicle_id is null", async () => {
      const created = await createExpense(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });

      const updated = await updateExpense(created.id, ctx.orgId, {
        vehicle_id: null,
      });

      expect(updated.vehicleId).toBeNull();
    });

    it("rejects associating a vehicle from another organization", async () => {
      const created = await createExpense(ctx.orgId, {
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });

      await expect(
        updateExpense(created.id, ctx.orgId, {
          vehicle_id: ctx.otherOrgVehicleId,
        }),
      ).rejects.toThrow("Vehicle not found");
    });

    it("does not allow updating another organization's expense", async () => {
      const created = await createExpense(ctx.orgId, {
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });

      await expect(
        updateExpense(created.id, ctx.otherOrgId, { amount: 100 }),
      ).rejects.toThrow("not found");
    });
  });

  describe("list", () => {
    it("lists expenses for the organization only", async () => {
      await createExpense(ctx.orgId, {
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });
      await createExpense(ctx.orgId, {
        vehicle_id: ctx.otherVehicleId,
        category: "CLEANING",
        amount: 30,
        expense_date: new Date("2026-08-21T09:00:00Z"),
      });
      await createExpense(ctx.otherOrgId, {
        category: "FUEL",
        amount: 999,
        expense_date: new Date("2026-08-22T09:00:00Z"),
      });

      const expenses = await listExpenses(ctx.orgId);
      expect(expenses).toHaveLength(2);
    });

    it("filters by vehicle", async () => {
      await createExpense(ctx.orgId, {
        vehicle_id: ctx.vehicleId,
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });
      await createExpense(ctx.orgId, {
        vehicle_id: ctx.otherVehicleId,
        category: "CLEANING",
        amount: 30,
        expense_date: new Date("2026-08-21T09:00:00Z"),
      });

      const expenses = await listExpenses(ctx.orgId, ctx.vehicleId);
      expect(expenses).toHaveLength(1);
      expect(expenses[0].vehicleId).toBe(ctx.vehicleId);
    });
  });

  describe("soft delete", () => {
    it("soft deletes an expense", async () => {
      const created = await createExpense(ctx.orgId, {
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });

      await deleteExpense(created.id, ctx.orgId);

      await expect(
        getExpense(created.id, ctx.orgId),
      ).rejects.toThrow("not found");
    });

    it("rejects deleting another organization's expense", async () => {
      const created = await createExpense(ctx.orgId, {
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });

      await expect(
        deleteExpense(created.id, ctx.otherOrgId),
      ).rejects.toThrow("not found");
    });

    it("excludes soft-deleted expenses from list", async () => {
      const created = await createExpense(ctx.orgId, {
        category: "FUEL",
        amount: 50,
        expense_date: new Date("2026-08-20T09:00:00Z"),
      });
      await deleteExpense(created.id, ctx.orgId);

      const expenses = await listExpenses(ctx.orgId);
      expect(expenses).toHaveLength(0);
    });
  });
});
