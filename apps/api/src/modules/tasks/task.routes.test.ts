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
        due_date: "2026-09-01T09:00:00Z",
        ...overrides,
      });
    return res;
  }

  it("creates a task via the API", async () => {
    const res = await createTask({ notes: "Insurance renewal" });

    expect(res.status).toBe(201);
    expect(res.body.data.dueDate).toBe("2026-09-01T09:00:00.000Z");
    expect(res.body.data.status).toBe("PENDING");
    expect(res.body.data.notes).toBe("Insurance renewal");
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
      .send({ due_date: "not-a-date" });
    expect(res.status).toBe(422);
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
      .send({ notes: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.data.notes).toBe("Updated");
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
    const otherOrg = await prisma.organization.create({ data: { name: "Org B" } });
    const otherTask = await prisma.task.create({
      data: {
        organization_id: otherOrg.id,
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
