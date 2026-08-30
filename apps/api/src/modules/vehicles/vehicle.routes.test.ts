import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { cleanup } from "../../test/helpers";
import { generateAccessToken } from "../auth";

describe("vehicle routes", () => {
  let token: string;

  beforeEach(async () => {
    await cleanup();
    const organization = await prisma.organization.create({
      data: { name: "Vehicle test organization" },
    });
    const owner = await prisma.user.create({
      data: {
        organization_id: organization.id,
        email: `vehicle-owner-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "OWNER",
      },
    });
    token = generateAccessToken({
      sub: owner.id,
      org: organization.id,
      role: "OWNER",
    });
  });

  function vehiclePayload(overrides: Record<string, unknown> = {}) {
    return {
      make: "Toyota",
      model: "Corolla",
      plate_number: `VEH-${Date.now()}-${Math.random()}`,
      year: 2024,
      color: "White",
      transmission: "AUTOMATIC",
      fuel_type: "PETROL",
      seats: 5,
      current_mileage: 12000,
      status: "AVAILABLE",
      ...overrides,
    };
  }

  async function createVehicle(overrides: Record<string, unknown> = {}) {
    return request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send(vehiclePayload(overrides));
  }

  it("creates and reads a vehicle with notes", async () => {
    const created = await createVehicle({ notes: "Needs seasonal tires" });

    expect(created.status).toBe(201);
    expect(created.body.data.notes).toBe("Needs seasonal tires");

    const detail = await request(app)
      .get(`/api/vehicles/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(detail.status).toBe(200);
    expect(detail.body.data.notes).toBe("Needs seasonal tires");
    expect(detail.body.data).not.toHaveProperty("vin");
    expect(detail.body.data).not.toHaveProperty("engineNumber");
  });

  it("creates a vehicle without notes", async () => {
    const created = await createVehicle();

    expect(created.status).toBe(201);
    expect(created.body.data.notes).toBeNull();
  });

  it("updates and clears vehicle notes", async () => {
    const payload = vehiclePayload({ notes: "Original note" });
    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    const updated = await request(app)
      .patch(`/api/vehicles/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...payload, notes: "Updated note" });

    expect(updated.status).toBe(200);
    expect(updated.body.data.notes).toBe("Updated note");

    const cleared = await request(app)
      .patch(`/api/vehicles/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...payload, notes: null });

    expect(cleared.status).toBe(200);
    expect(cleared.body.data.notes).toBeNull();
  });

  it("rejects meaningless empty notes", async () => {
    const response = await createVehicle({ notes: "" });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
