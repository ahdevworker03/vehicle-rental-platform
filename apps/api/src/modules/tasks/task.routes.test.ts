import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { generateAccessToken } from "../../modules/auth";
import { cleanup } from "../../test/helpers";

describe("task routes", () => {
  let orgId: string;
  let token: string;

  beforeEach(async () => {
    await cleanup();

    const org = await prisma.organization.create({ data: { name: "Org A" } });
    orgId = org.id;

    const user = await prisma.user.create({
      data: {
        organization_id: org.id,
        email: `owner-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "OWNER",
      },
    });

    token = generateAccessToken({
      sub: user.id,
      org: org.id,
      role: "OWNER",
    });
  });

  async function createTask(overrides: Record<string, unknown> = {}) {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Renew insurance",
        due_date: "2026-09-01T09:00:00Z",
        ...overrides,
      });
    return res;
  }

  it("creates a task via the API", async () => {
    const res = await createTask({ notes: "Insurance renewal" });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Renew insurance");
    expect(res.body.data.dueDate).toBe("2026-09-01T09:00:00.000Z");
    expect(res.body.data.status).toBe("PENDING");
    expect(res.body.data.notes).toBe("Insurance renewal");
    expect(res.body.data.recurrenceInterval).toBeNull();
    expect(res.body.data.recurrenceUnit).toBeNull();
    expect(res.body.data.occurrenceNumber).toBe(1);
    expect(res.body.data.predecessorId).toBeNull();
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["whitespace-only", "   "],
  ])("rejects a %s title", async (_case, title) => {
    const body: Record<string, unknown> = {
      due_date: "2026-09-01T09:00:00Z",
    };
    if (title !== undefined) body.title = title;

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("keeps title and notes independent", async () => {
    const withoutNotes = await createTask({ title: "Vehicle inspection" });
    const withDifferentNotes = await createTask({
      title: "Collect payment",
      notes: "Call the customer first",
    });

    expect(withoutNotes.body.data.title).toBe("Vehicle inspection");
    expect(withoutNotes.body.data.notes).toBeNull();
    expect(withDifferentNotes.body.data.title).toBe("Collect payment");
    expect(withDifferentNotes.body.data.notes).toBe("Call the customer first");
  });

  it("creates and completes a recurring task through the API", async () => {
    const created = await createTask({
      recurrence_interval: 1,
      recurrence_unit: "WEEK",
    });

    expect(created.status).toBe(201);
    expect(created.body.data.recurrenceInterval).toBe(1);
    expect(created.body.data.recurrenceUnit).toBe("WEEK");
    const completed = await request(app)
      .post(`/api/tasks/${created.body.data.id}/complete`)
      .set("Authorization", `Bearer ${token}`);

    expect(completed.status).toBe(200);
    const successor = await prisma.task.findFirstOrThrow({
      where: { predecessor_id: created.body.data.id },
    });
    expect(successor.title).toBe("Renew insurance");
    expect(successor.due_date.toISOString()).toBe("2026-09-08T09:00:00.000Z");
  });

  it("rejects an unauthenticated request", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });

  it("rejects creating a task without a due date via validation", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it("rejects creating a task with an invalid due date", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Invalid date task", due_date: "not-a-date" });
    expect(res.status).toBe(422);
  });

  it("rejects incomplete or conflicting recurrence configuration", async () => {
    const missingUnit = await createTask({ recurrence_interval: 2 });
    const conflictingEnd = await createTask({
      recurrence_interval: 1,
      recurrence_unit: "DAY",
      recurrence_end_date: "2026-09-10",
      recurrence_end_count: 3,
    });

    expect(missingUnit.status).toBe(422);
    expect(conflictingEnd.status).toBe(422);
  });

  it("rejects decimal recurrence values", async () => {
    const decimalInterval = await createTask({
      recurrence_interval: 1.5,
      recurrence_unit: "DAY",
    });
    const decimalEndCount = await createTask({
      recurrence_interval: 1,
      recurrence_unit: "DAY",
      recurrence_end_count: 2.5,
    });

    expect(decimalInterval.status).toBe(422);
    expect(decimalEndCount.status).toBe(422);
  });

  it("accepts only date-only recurrence end dates", async () => {
    const invalid = await createTask({
      recurrence_interval: 1,
      recurrence_unit: "DAY",
      recurrence_end_date: "2026-09-10T00:00:00Z",
    });
    const valid = await createTask({
      recurrence_interval: 1,
      recurrence_unit: "DAY",
      recurrence_end_date: "2026-09-10",
    });

    expect(invalid.status).toBe(422);
    expect(valid.status).toBe(201);
    expect(valid.body.data.recurrenceEndDate).toBe("2026-09-10");
  });

  it("lists tasks for the authenticated organization", async () => {
    await createTask();
    await createTask();

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it("gets a task", async () => {
    const created = await createTask();
    const id = created.body.data.id;

    const res = await request(app)
      .get(`/api/tasks/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it("updates a task", async () => {
    const created = await createTask();
    const id = created.body.data.id;

    const res = await request(app)
      .patch(`/api/tasks/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated title", notes: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated title");
    expect(res.body.data.notes).toBe("Updated");
  });

  it("rejects a whitespace-only title update", async () => {
    const created = await createTask();

    const res = await request(app)
      .patch(`/api/tasks/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "   " });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("updates recurrence for a pending task", async () => {
    const created = await createTask();
    const res = await request(app)
      .patch(`/api/tasks/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ recurrence_interval: 1, recurrence_unit: "MONTH" });

    expect(res.status).toBe(200);
    expect(res.body.data.recurrenceInterval).toBe(1);
    expect(res.body.data.recurrenceUnit).toBe("MONTH");
  });

  it("rejects changing recurrence after completion", async () => {
    const created = await createTask({
      recurrence_interval: 1,
      recurrence_unit: "DAY",
    });
    await request(app)
      .post(`/api/tasks/${created.body.data.id}/complete`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/tasks/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ recurrence_interval: null, recurrence_unit: null });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe(
      "TASK_RECURRENCE_CANNOT_CHANGE_AFTER_COMPLETION",
    );
  });

  it("completes a pending task", async () => {
    const created = await createTask();
    const id = created.body.data.id;

    const res = await request(app)
      .post(`/api/tasks/${id}/complete`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("COMPLETED");
  });

  it("returns 409 when completing an already completed task", async () => {
    const created = await createTask();
    const id = created.body.data.id;

    await request(app)
      .post(`/api/tasks/${id}/complete`)
      .set("Authorization", `Bearer ${token}`);
    const res = await request(app)
      .post(`/api/tasks/${id}/complete`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("TASK_ALREADY_COMPLETED");
  });

  it("soft deletes a task", async () => {
    const created = await createTask();
    const id = created.body.data.id;

    const res = await request(app)
      .delete(`/api/tasks/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("excludes a deleted task from list results", async () => {
    const created = await createTask();
    await request(app)
      .delete(`/api/tasks/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.data).toHaveLength(0);
  });

  it("does not expose a task belonging to another organization", async () => {
    const otherOrg = await prisma.organization.create({
      data: { name: "Org B" },
    });
    const otherTask = await prisma.task.create({
      data: {
        organization_id: otherOrg.id,
        title: "Other organization task",
        due_date: new Date("2026-09-01T09:00:00Z"),
        status: "PENDING",
        notes: null,
      },
    });

    const getRes = await request(app)
      .get(`/api/tasks/${otherTask.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.status).toBe(404);

    const updateRes = await request(app)
      .patch(`/api/tasks/${otherTask.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ notes: "nope" });
    expect(updateRes.status).toBe(404);

    const completeRes = await request(app)
      .post(`/api/tasks/${otherTask.id}/complete`)
      .set("Authorization", `Bearer ${token}`);
    expect(completeRes.status).toBe(404);

    const deleteRes = await request(app)
      .delete(`/api/tasks/${otherTask.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.status).toBe(404);
  });

  it("rejects task mutations from a non-owner role", async () => {
    const employee = await prisma.user.create({
      data: {
        organization_id: orgId,
        email: `emp-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "EMPLOYEE",
      },
    });
    const employeeToken = generateAccessToken({
      sub: employee.id,
      org: orgId,
      role: "EMPLOYEE",
    });

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ due_date: "2026-09-01T09:00:00Z" });

    expect(res.status).toBe(403);
  });
});
