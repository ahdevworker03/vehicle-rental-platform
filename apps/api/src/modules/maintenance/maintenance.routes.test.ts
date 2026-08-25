import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { generateAccessToken } from "../../modules/auth";
import { cleanup } from "../../test/helpers";

describe("maintenance routes", () => {
  let orgId: string;
  let vehicleId: string;
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

    const vehicle = await prisma.vehicle.create({
      data: {
        organization_id: org.id,
        make: "Toyota",
        model: "Corolla",
        plate_number: "API-MAINT-1",
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

  it("creates a maintenance record via the API", async () => {
    const res = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: vehicleId,
        type: "REPAIR",
        maintenance_date: "2026-08-20T09:00:00Z",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.vehicleId).toBe(vehicleId);
    expect(res.body.data.status).toBe("SCHEDULED");
  });

  it("rejects an unauthenticated request", async () => {
    const res = await request(app).get("/api/maintenance");

    expect(res.status).toBe(401);
  });

  it("lists vehicle maintenance history via the API", async () => {
    await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: vehicleId,
        type: "REPAIR",
        maintenance_date: "2026-08-20T09:00:00Z",
      });

    const res = await request(app)
      .get(`/api/vehicles/${vehicleId}/maintenance`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].type).toBe("REPAIR");
  });

  it("rejects an invalid maintenance type via validation", async () => {
    const res = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: vehicleId,
        type: "OIL_CHANGE",
        maintenance_date: "2026-08-20T09:00:00Z",
      });

    expect(res.status).toBe(422);
  });

  it("ignores a completed status sent to create and creates a scheduled record", async () => {
    const res = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: vehicleId,
        type: "REPAIR",
        status: "COMPLETED",
        maintenance_date: "2026-08-20T09:00:00Z",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("SCHEDULED");
    expect(res.body.data.completedAt).toBeNull();
  });

  it("completes a maintenance record via the API", async () => {
    const created = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: vehicleId,
        type: "REPAIR",
        maintenance_date: "2026-08-20T09:00:00Z",
      });

    const id = created.body.data.id;

    const res = await request(app)
      .post(`/api/maintenance/${id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send({ cost: 120 });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("COMPLETED");
    expect(res.body.data.completedAt).not.toBeNull();
    expect(res.body.data.cost).toBe(120);
  });

  it("rejects completing without a cost via validation", async () => {
    const created = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: vehicleId,
        type: "REPAIR",
        maintenance_date: "2026-08-20T09:00:00Z",
      });

    const id = created.body.data.id;

    const res = await request(app)
      .post(`/api/maintenance/${id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(422);
  });

  it("returns a conflict when starting maintenance for a vehicle with a live rental", async () => {
    const customer = await prisma.customer.create({
      data: {
        organization_id: orgId,
        first_name: "Active",
        last_name: "Renter",
        phone: "03111111",
        address: "Beirut",
        national_id: `API-ACTIVE-NID-${Date.now()}`,
        license_number: `API-ACTIVE-LICENSE-${Date.now()}`,
        license_expiry_date: new Date("2030-09-30T00:00:00Z"),
      },
    });
    await prisma.rental.create({
      data: {
        organization_id: orgId,
        customer_id: customer.id,
        vehicle_id: vehicleId,
        pickup_date: new Date("2030-01-01T09:00:00Z"),
        expected_return_date: new Date("2030-01-03T09:00:00Z"),
        status: "ACTIVE",
        daily_rate: 100,
        total_amount: 200,
        deposit_amount: 50,
      },
    });
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: "RENTED" },
    });
    const created = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: vehicleId,
        type: "REPAIR",
        maintenance_date: "2030-01-01T09:00:00Z",
      });

    const response = await request(app)
      .patch(`/api/maintenance/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "IN_PROGRESS" });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("VEHICLE_UNAVAILABLE");
  });

  it("soft deletes a maintenance record via the API", async () => {
    const created = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: vehicleId,
        type: "REPAIR",
        maintenance_date: "2026-08-20T09:00:00Z",
      });

    const id = created.body.data.id;

    const del = await request(app)
      .delete(`/api/maintenance/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(del.status).toBe(204);

    const get = await request(app)
      .get(`/api/maintenance/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(get.status).toBe(404);
  });

  it("does not expose another organization's maintenance record", async () => {
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
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vehicle_id: vehicleId,
        type: "REPAIR",
        maintenance_date: "2026-08-20T09:00:00Z",
      });

    const id = created.body.data.id;

    const res = await request(app)
      .get(`/api/maintenance/${id}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });
});
