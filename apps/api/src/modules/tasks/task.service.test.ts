import { describe, it, expect, beforeEach } from "vitest";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from "./task.service";
import type { TaskRecurrenceUnit } from "./task.types";
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
      title?: string;
      dueDate?: Date;
      notes?: string;
      recurrenceInterval?: number;
      recurrenceUnit?: TaskRecurrenceUnit;
      recurrenceEndDate?: Date;
      recurrenceEndCount?: number;
      occurrenceNumber?: number;
    } = {},
  ) {
    return prisma.task.create({
      data: {
        organization_id: orgId,
        title: overrides.title ?? "Test task",
        due_date: overrides.dueDate ?? new Date("2026-09-01T09:00:00Z"),
        status: "PENDING",
        recurrence_interval: overrides.recurrenceInterval ?? null,
        recurrence_unit: overrides.recurrenceUnit ?? null,
        recurrence_end_date: overrides.recurrenceEndDate ?? null,
        recurrence_end_count: overrides.recurrenceEndCount ?? null,
        occurrence_number: overrides.occurrenceNumber ?? 1,
        notes: overrides.notes ?? null,
      },
    });
  }

  describe("create", () => {
    it("creates a task for the authenticated organization as PENDING", async () => {
      const task = await createTask(ctx.orgId, {
        title: "Oil change",
        due_date: new Date("2026-09-01T09:00:00Z"),
        notes: "Oil change reminder",
      });

      expect(task.title).toBe("Oil change");
      expect(task.dueDate).toBe("2026-09-01T09:00:00.000Z");
      expect(task.status).toBe("PENDING");
      expect(task.notes).toBe("Oil change reminder");
      expect(task.recurrenceInterval).toBeNull();
      expect(task.recurrenceUnit).toBeNull();
      expect(task.occurrenceNumber).toBe(1);
    });

    it("defaults notes to null when not provided", async () => {
      const task = await createTask(ctx.orgId, {
        title: "Task without notes",
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
    it("updates the title, due date, and notes of a task", async () => {
      const created = await createTaskInOrg(ctx.orgId);
      const updated = await updateTask(created.id, ctx.orgId, {
        title: "Updated task",
        due_date: new Date("2026-10-01T09:00:00Z"),
        notes: "Updated reminder",
      });

      expect(updated.title).toBe("Updated task");
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
      [2, "DAY", "2026-09-03T09:00:00.000Z"],
      [2, "WEEK", "2026-09-15T09:00:00.000Z"],
      [2, "MONTH", "2026-11-01T10:00:00.000Z"],
    ] as const)(
      "creates the next %s %s occurrence from the completed due date",
      async (recurrenceInterval, recurrenceUnit, expectedDueDate) => {
        const task = await createTaskInOrg(ctx.orgId, {
          title: "Recurring task",
          recurrenceInterval,
          recurrenceUnit,
          notes: "Recurring reminder",
        });

        const completed = await completeTask(task.id, ctx.orgId);

        expect(completed.status).toBe("COMPLETED");
        const successor = await prisma.task.findFirstOrThrow({
          where: { predecessor_id: task.id },
        });
        expect(successor.organization_id).toBe(ctx.orgId);
        expect(successor.title).toBe("Recurring task");
        expect(successor.status).toBe("PENDING");
        expect(successor.recurrence_interval).toBe(recurrenceInterval);
        expect(successor.recurrence_unit).toBe(recurrenceUnit);
        expect(successor.occurrence_number).toBe(2);
        expect(successor.notes).toBe("Recurring reminder");
        expect(successor.due_date.toISOString()).toBe(expectedDueDate);
      },
    );

    it("clamps monthly recurrence to the final valid calendar day", async () => {
      const task = await createTaskInOrg(ctx.orgId, {
        dueDate: new Date("2026-01-31T09:00:00Z"),
        recurrenceInterval: 1,
        recurrenceUnit: "MONTH",
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
        recurrenceInterval: 1,
        recurrenceUnit: "MONTH",
      });

      await completeTask(task.id, ctx.orgId);

      const successor = await prisma.task.findFirstOrThrow({
        where: { predecessor_id: task.id },
      });
      expect(successor.due_date.toISOString()).toBe("2024-02-29T09:00:00.000Z");
    });

    it("resolves nonexistent Beirut-local times forward across daylight saving", async () => {
      const task = await createTaskInOrg(ctx.orgId, {
        dueDate: new Date("2026-03-27T22:30:00Z"),
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
      });

      await completeTask(task.id, ctx.orgId);

      const successor = await prisma.task.findFirstOrThrow({
        where: { predecessor_id: task.id },
      });
      expect(successor.due_date.toISOString()).toBe("2026-03-28T22:30:00.000Z");
    });

    it("uses the earlier instant for ambiguous Beirut-local times", async () => {
      const original = await createTaskInOrg(ctx.orgId, {
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
        dueDate: new Date("2026-10-23T20:30:00Z"),
      });
      await completeTask(original.id, ctx.orgId);
      const successor = await prisma.task.findFirstOrThrow({
        where: { predecessor_id: original.id },
      });

      expect(successor.due_date.toISOString()).toBe("2026-10-24T20:30:00.000Z");
    });

    it("does not create a successor when the end count is the original occurrence", async () => {
      const original = await createTaskInOrg(ctx.orgId, {
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
        recurrenceEndCount: 1,
      });

      await completeTask(original.id, ctx.orgId);

      await expect(
        prisma.task.count({ where: { predecessor_id: original.id } }),
      ).resolves.toBe(0);
    });

    it("does not create a sixth occurrence when the end count is five", async () => {
      let current = await createTaskInOrg(ctx.orgId, {
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
        recurrenceEndCount: 5,
      });

      for (let occurrence = 1; occurrence <= 5; occurrence += 1) {
        await completeTask(current.id, ctx.orgId);
        if (occurrence < 5) {
          current = await prisma.task.findFirstOrThrow({
            where: { predecessor_id: current.id },
          });
        }
      }

      expect(current.occurrence_number).toBe(5);
      await expect(
        prisma.task.count({ where: { predecessor_id: current.id } }),
      ).resolves.toBe(0);
    });

    it("treats the recurrence end date as an inclusive Beirut business date", async () => {
      const original = await createTaskInOrg(ctx.orgId, {
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
        recurrenceEndDate: new Date("2026-09-02T00:00:00Z"),
      });
      await completeTask(original.id, ctx.orgId);
      const second = await prisma.task.findFirstOrThrow({
        where: { predecessor_id: original.id },
      });
      expect(second.due_date.toISOString()).toBe("2026-09-02T09:00:00.000Z");

      await completeTask(second.id, ctx.orgId);

      await expect(
        prisma.task.count({ where: { predecessor_id: second.id } }),
      ).resolves.toBe(0);
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
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
      });

      const results = await Promise.allSettled([
        completeTask(task.id, ctx.orgId),
        completeTask(task.id, ctx.orgId),
      ]);

      expect(
        results.filter((result) => result.status === "fulfilled"),
      ).toHaveLength(1);
      expect(
        results.filter((result) => result.status === "rejected"),
      ).toHaveLength(1);
      await expect(
        prisma.task.count({ where: { predecessor_id: task.id } }),
      ).resolves.toBe(1);
    });

    it("rolls back completion when a successor already exists", async () => {
      const task = await createTaskInOrg(ctx.orgId, {
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
      });
      await createTaskInOrg(ctx.orgId, {
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
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
        recurrence_interval: 1,
        recurrence_unit: "MONTH",
      });

      expect(updated.recurrenceInterval).toBe(1);
      expect(updated.recurrenceUnit).toBe("MONTH");
    });

    it("stops recurrence on a pending occurrence", async () => {
      const task = await createTaskInOrg(ctx.orgId, {
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
        recurrenceEndCount: 5,
      });

      const updated = await updateTask(task.id, ctx.orgId, {
        recurrence_interval: null,
        recurrence_unit: null,
        recurrence_end_date: null,
        recurrence_end_count: null,
      });
      await completeTask(task.id, ctx.orgId);

      expect(updated.recurrenceInterval).toBeNull();
      expect(updated.recurrenceUnit).toBeNull();
      expect(updated.recurrenceEndCount).toBeNull();
      await expect(
        prisma.task.count({ where: { predecessor_id: task.id } }),
      ).resolves.toBe(0);
    });

    it("rejects recurrence end conditions without recurrence", async () => {
      const task = await createTaskInOrg(ctx.orgId);

      await expect(
        updateTask(task.id, ctx.orgId, { recurrence_end_count: 3 }),
      ).rejects.toThrow("recurrence configuration is invalid");
    });

    it("rejects changing recurrence after completion", async () => {
      const task = await createTaskInOrg(ctx.orgId, {
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
      });
      await completeTask(task.id, ctx.orgId);

      await expect(
        updateTask(task.id, ctx.orgId, {
          recurrence_interval: null,
          recurrence_unit: null,
        }),
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
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
      });
      await deleteTask(task.id, ctx.orgId);

      await expect(completeTask(task.id, ctx.orgId)).rejects.toThrow(
        "Task not found",
      );
      await expect(
        prisma.task.count({ where: { predecessor_id: task.id } }),
      ).resolves.toBe(0);
    });

    it("soft deletes only the selected occurrence", async () => {
      const original = await createTaskInOrg(ctx.orgId, {
        recurrenceInterval: 1,
        recurrenceUnit: "DAY",
      });
      await completeTask(original.id, ctx.orgId);
      const successor = await prisma.task.findFirstOrThrow({
        where: { predecessor_id: original.id },
      });

      await deleteTask(successor.id, ctx.orgId);

      await expect(
        prisma.task.findUniqueOrThrow({ where: { id: original.id } }),
      ).resolves.toMatchObject({ deleted_at: null });
      await expect(
        prisma.task.findUniqueOrThrow({ where: { id: successor.id } }),
      ).resolves.not.toMatchObject({ deleted_at: null });
    });
  });
});
