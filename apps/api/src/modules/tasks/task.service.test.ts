import { describe, it, expect, beforeEach } from "vitest";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from "./task.service";
import type { TaskRecurrenceType } from "./task.types";
import { prisma } from "../../database";
import { cleanup, seed, type SeedOrg } from "../../test/helpers";

describe("task service", () => {
  let ctx: SeedOrg;

  beforeEach(async () => {
    await cleanup();
    ctx = await seed();
  });

  async function createTaskInOrg(
    orgId: string,
    overrides: {
      dueDate?: Date;
      notes?: string;
      recurrenceType?: TaskRecurrenceType;
    } = {},
  ) {
    return prisma.task.create({
      data: {
        organization_id: orgId,
        due_date: overrides.dueDate ?? new Date("2026-09-01T09:00:00Z"),
        status: "PENDING",
        recurrence_type: overrides.recurrenceType ?? "NONE",
        notes: overrides.notes ?? null,
      },
    });
  }

  describe("create", () => {
    it("creates a task for the authenticated organization as PENDING", async () => {
      const task = await createTask(ctx.orgId, {
        due_date: new Date("2026-09-01T09:00:00Z"),
        notes: "Oil change reminder",
      });

      expect(task.dueDate).toBe("2026-09-01T09:00:00.000Z");
      expect(task.status).toBe("PENDING");
      expect(task.notes).toBe("Oil change reminder");
      expect(task.recurrenceType).toBe("NONE");
    });

    it("defaults notes to null when not provided", async () => {
      const task = await createTask(ctx.orgId, {
        due_date: new Date("2026-09-01T09:00:00Z"),
      });

      expect(task.notes).toBeNull();
      expect(task.status).toBe("PENDING");
    });
  });

  describe("list", () => {
    it("lists tasks only from the authenticated organization", async () => {
      await createTaskInOrg(ctx.orgId);
      await createTaskInOrg(ctx.orgId);
      await createTaskInOrg(ctx.otherOrgId);

      const tasks = await listTasks(ctx.orgId);

      expect(tasks).toHaveLength(2);
    });

    it("returns an empty list when the organization has no tasks", async () => {
      expect(await listTasks(ctx.orgId)).toEqual([]);
    });

    it("excludes soft-deleted tasks", async () => {
      await createTaskInOrg(ctx.orgId);
      const toDelete = await createTaskInOrg(ctx.orgId);
      await prisma.task.update({
        where: { id: toDelete.id },
        data: { deleted_at: new Date() },
      });

      const tasks = await listTasks(ctx.orgId);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).not.toBe(toDelete.id);
    });
  });

  describe("get", () => {
    it("returns a task in the authenticated organization", async () => {
      const created = await createTaskInOrg(ctx.orgId);
      const task = await getTask(created.id, ctx.orgId);
      expect(task.id).toBe(created.id);
    });

    it("rejects a task that does not exist", async () => {
      await expect(
        getTask("00000000-0000-0000-0000-000000000000", ctx.orgId),
      ).rejects.toThrow("Task not found");
    });

    it("rejects a task belonging to another organization", async () => {
      const created = await createTaskInOrg(ctx.otherOrgId);
      await expect(getTask(created.id, ctx.orgId)).rejects.toThrow(
        "Task not found",
      );
    });
  });

  describe("update", () => {
    it("updates the due date and notes of a task", async () => {
      const created = await createTaskInOrg(ctx.orgId);
      const updated = await updateTask(created.id, ctx.orgId, {
        due_date: new Date("2026-10-01T09:00:00Z"),
        notes: "Updated reminder",
      });

      expect(updated.dueDate).toBe("2026-10-01T09:00:00.000Z");
      expect(updated.notes).toBe("Updated reminder");
    });

    it("clears notes when null is provided", async () => {
      const created = await createTaskInOrg(ctx.orgId, { notes: "some note" });
      const updated = await updateTask(created.id, ctx.orgId, { notes: null });
      expect(updated.notes).toBeNull();
    });

    it("rejects updating a task in another organization", async () => {
      const created = await createTaskInOrg(ctx.otherOrgId);
      await expect(
        updateTask(created.id, ctx.orgId, {
          notes: "nope",
        }),
      ).rejects.toThrow("Task not found");
    });
  });

  describe("complete", () => {
    it("completes a pending task", async () => {
      const created = await createTaskInOrg(ctx.orgId);
      const completed = await completeTask(created.id, ctx.orgId);
      expect(completed.status).toBe("COMPLETED");
    });

    it("keeps an already completed task COMPLETED without reverting", async () => {
      const created = await createTaskInOrg(ctx.orgId);
      await completeTask(created.id, ctx.orgId);

      await expect(completeTask(created.id, ctx.orgId)).rejects.toThrow(
        "Task is already completed",
      );

      const task = await getTask(created.id, ctx.orgId);
      expect(task.status).toBe("COMPLETED");
    });

    it("rejects completing a task in another organization", async () => {
      const created = await createTaskInOrg(ctx.otherOrgId);
      await expect(completeTask(created.id, ctx.orgId)).rejects.toThrow(
        "Task not found",
      );
    });

    it.each([
      ["DAILY", "2026-09-02T09:00:00.000Z"],
      ["WEEKLY", "2026-09-08T09:00:00.000Z"],
    ] as const)(
      "creates the next %s occurrence from the completed due date",
      async (recurrenceType, expectedDueDate) => {
        const task = await createTaskInOrg(ctx.orgId, {
          recurrenceType,
          notes: "Recurring reminder",
        });

        const completed = await completeTask(task.id, ctx.orgId);

        expect(completed.status).toBe("COMPLETED");
        const successor = await prisma.task.findFirstOrThrow({
          where: { predecessor_id: task.id },
        });
        expect(successor.organization_id).toBe(ctx.orgId);
        expect(successor.status).toBe("PENDING");
        expect(successor.recurrence_type).toBe(recurrenceType);
        expect(successor.notes).toBe("Recurring reminder");
        expect(successor.due_date.toISOString()).toBe(expectedDueDate);
      },
    );

    it("clamps monthly recurrence to the final valid calendar day", async () => {
      const task = await createTaskInOrg(ctx.orgId, {
        dueDate: new Date("2026-01-31T09:00:00Z"),
        recurrenceType: "MONTHLY",
      });

      await completeTask(task.id, ctx.orgId);

      const successor = await prisma.task.findFirstOrThrow({
        where: { predecessor_id: task.id },
      });
      expect(successor.due_date.toISOString()).toBe("2026-02-28T09:00:00.000Z");
    });

    it("keeps February 29 in a leap year", async () => {
      const task = await createTaskInOrg(ctx.orgId, {
        dueDate: new Date("2024-01-31T09:00:00Z"),
        recurrenceType: "MONTHLY",
      });

      await completeTask(task.id, ctx.orgId);

      const successor = await prisma.task.findFirstOrThrow({
        where: { predecessor_id: task.id },
      });
      expect(successor.due_date.toISOString()).toBe("2024-02-29T09:00:00.000Z");
    });

    it("does not create a successor for a non-recurring task", async () => {
      const task = await createTaskInOrg(ctx.orgId);

      await completeTask(task.id, ctx.orgId);

      await expect(
        prisma.task.count({ where: { predecessor_id: task.id } }),
      ).resolves.toBe(0);
    });

    it("creates at most one successor during concurrent completion attempts", async () => {
      const task = await createTaskInOrg(ctx.orgId, {
        recurrenceType: "DAILY",
      });

      const results = await Promise.allSettled([
        completeTask(task.id, ctx.orgId),
        completeTask(task.id, ctx.orgId),
      ]);

      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
      await expect(
        prisma.task.count({ where: { predecessor_id: task.id } }),
      ).resolves.toBe(1);
    });

    it("rolls back completion when a successor already exists", async () => {
      const task = await createTaskInOrg(ctx.orgId, {
        recurrenceType: "DAILY",
      });
      await createTaskInOrg(ctx.orgId, {
        recurrenceType: "DAILY",
      }).then((successor) =>
        prisma.task.update({
          where: { id: successor.id },
          data: { predecessor_id: task.id },
        }),
      );

      await expect(completeTask(task.id, ctx.orgId)).rejects.toThrow(
        "Task is already completed",
      );
      await expect(
        prisma.task.findUniqueOrThrow({ where: { id: task.id } }),
      ).resolves.toMatchObject({ status: "PENDING" });
    });
  });

  describe("recurrence updates", () => {
    it("allows a pending task's recurrence to be changed", async () => {
      const task = await createTaskInOrg(ctx.orgId);

      const updated = await updateTask(task.id, ctx.orgId, {
        recurrence_type: "MONTHLY",
      });

      expect(updated.recurrenceType).toBe("MONTHLY");
    });

    it("rejects changing recurrence after completion", async () => {
      const task = await createTaskInOrg(ctx.orgId, {
        recurrenceType: "DAILY",
      });
      await completeTask(task.id, ctx.orgId);

      await expect(
        updateTask(task.id, ctx.orgId, { recurrence_type: "NONE" }),
      ).rejects.toThrow("recurrence cannot be changed");
    });
  });

  describe("delete", () => {
    it("soft deletes a task", async () => {
      const created = await createTaskInOrg(ctx.orgId);
      await deleteTask(created.id, ctx.orgId);

      const row = await prisma.task.findUnique({ where: { id: created.id } });
      expect(row?.deleted_at).not.toBeNull();
    });

    it("excludes a deleted task from normal queries", async () => {
      const created = await createTaskInOrg(ctx.orgId);
      await deleteTask(created.id, ctx.orgId);

      await expect(getTask(created.id, ctx.orgId)).rejects.toThrow(
        "Task not found",
      );
      expect(await listTasks(ctx.orgId)).toEqual([]);
    });

    it("rejects deleting a task in another organization", async () => {
      const created = await createTaskInOrg(ctx.otherOrgId);
      await expect(deleteTask(created.id, ctx.orgId)).rejects.toThrow(
        "Task not found",
      );
    });

    it("does not create a successor for a soft-deleted recurring task", async () => {
      const task = await createTaskInOrg(ctx.orgId, {
        recurrenceType: "DAILY",
      });
      await deleteTask(task.id, ctx.orgId);

      await expect(completeTask(task.id, ctx.orgId)).rejects.toThrow(
        "Task not found",
      );
      await expect(
        prisma.task.count({ where: { predecessor_id: task.id } }),
      ).resolves.toBe(0);
    });
  });
});
