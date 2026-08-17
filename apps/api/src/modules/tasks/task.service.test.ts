import { describe, it, expect, beforeEach } from "vitest";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from "./task.service";
import { prisma } from "../../database";
import { cleanup, seed, type SeedOrg } from "../../test/helpers";

describe("task service", () => {
  let ctx: SeedOrg;

  beforeEach(async () => {
    await cleanup();
    ctx = await seed();
  });

  async function createTaskInOrg(orgId: string, overrides: { notes?: string } = {}) {
    return prisma.task.create({
      data: {
        organization_id: orgId,
        due_date: new Date("2026-09-01T09:00:00Z"),
        status: "PENDING",
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
  });
});
