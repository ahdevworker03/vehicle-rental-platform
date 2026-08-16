import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { generateAccessToken } from "../../modules/auth";
import { cleanup } from "../../test/helpers";

describe("expense routes", () => {
  let vehicleId: string;
  let token: string;

  beforeEach(async () => {
    await cleanup();

    const org = await prisma.organization.create({ data: { name: "Org A" } });

    const user = await prisma.user.create({
      data: {
        organization_id: org.id,
        email: `owner-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "OWNER",
      },
    });

    const vehicle = await prisma.vehicle.create({
      data: {
        organization_id: org.id,
        make: "Toyota",
        model: "Corolla",
        plate_number: "API-EXP-1",
        year: 2020,
        color: "White",
        transmission: "AUTOMATIC",
        fuel_type: "PETROL",
        seats: 5,
        current_mileage: 1000,
        status: "AVAILABLE",
      },
    });
    vehicleId = vehicle.id;

    token = generateAccessToken({
      sub: user.id,
      org: org.id,
      role: "OWNER",
    });
  });

  it("creates an expense via the API", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: vehicleId,
        category: "FUEL",
        amount: 50,
        expense_date: "2026-08-20T09:00:00Z",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.category).toBe("FUEL");
    expect(res.body.data.amount).toBe(50);
    expect(res.body.data.vehicleId).toBe(vehicleId);
  });

  it("rejects an unauthenticated request", async () => {
    const res = await request(app).get("/api/expenses");
    expect(res.status).toBe(401);
  });

  it("lists expenses via the API", async () => {
    await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        category: "FUEL",
        amount: 50,
        expense_date: "2026-08-20T09:00:00Z",
      });

    const res = await request(app)
      .get("/api/expenses")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].category).toBe("FUEL");
  });

  it("rejects an invalid category via validation", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        category: "MAINTENANCE",
        amount: 50,
        expense_date: "2026-08-20T09:00:00Z",
      });

    expect(res.status).toBe(422);
  });

  it("rejects a negative amount via validation", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        category: "FUEL",
        amount: -5,
        expense_date: "2026-08-20T09:00:00Z",
      });

    expect(res.status).toBe(422);
  });

  it("soft deletes an expense via the API", async () => {
    const created = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        category: "FUEL",
        amount: 50,
        expense_date: "2026-08-20T09:00:00Z",
      });

    const id = created.body.data.id;

    const del = await request(app)
      .delete(`/api/expenses/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);

    const get = await request(app)
      .get(`/api/expenses/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(get.status).toBe(404);
  });

  it("does not expose another organization's expense", async () => {
    const otherOrg = await prisma.organization.create({
      data: { name: "Org B" },
    });
    const otherUser = await prisma.user.create({
      data: {
        organization_id: otherOrg.id,
        email: `other-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "OWNER",
      },
    });
    const otherToken = generateAccessToken({
      sub: otherUser.id,
      org: otherOrg.id,
      role: "OWNER",
    });

    const created = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        category: "FUEL",
        amount: 50,
        expense_date: "2026-08-20T09:00:00Z",
      });

    const id = created.body.data.id;

    const res = await request(app)
      .get(`/api/expenses/${id}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });

  it("rejects associating a vehicle from another organization", async () => {
    const otherOrg = await prisma.organization.create({
      data: { name: "Org B" },
    });
    const otherOrgVehicle = await prisma.vehicle.create({
      data: {
        organization_id: otherOrg.id,
        make: "Nissan",
        model: "Sunny",
        plate_number: "API-EXP-2",
        year: 2018,
        color: "Blue",
        transmission: "MANUAL",
        fuel_type: "PETROL",
        seats: 5,
        current_mileage: 3000,
        status: "AVAILABLE",
      },
    });

    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: otherOrgVehicle.id,
        category: "FUEL",
        amount: 50,
        expense_date: "2026-08-20T09:00:00Z",
      });

    expect(res.status).toBe(404);
  });

  it("clears a vehicle association via update", async () => {
    const created = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: vehicleId,
        category: "FUEL",
        amount: 50,
        expense_date: "2026-08-20T09:00:00Z",
      });

    const id = created.body.data.id;

    const res = await request(app)
      .patch(`/api/expenses/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ vehicle_id: null });

    expect(res.status).toBe(200);
    expect(res.body.data.vehicleId).toBeNull();
  });
});
