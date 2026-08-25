import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { generateAccessToken } from "../auth";
import { updateRental } from "./rental.service";
import { cleanup } from "../../test/helpers";

describe("rental routes", () => {
  let organizationId: string;
  let customerId: string;
  let vehicleId: string;
  let token: string;

  beforeEach(async () => {
    await cleanup();

    const organization = await prisma.organization.create({
      data: { name: "Rental test organization" },
    });
    organizationId = organization.id;

    const [customer, vehicle, owner] = await Promise.all([
      prisma.customer.create({
        data: {
          organization_id: organizationId,
          first_name: "Rental",
          last_name: "Customer",
          phone: "03000000",
          address: "Beirut",
          national_id: `RENTAL-NID-${Date.now()}`,
          license_number: `RENTAL-LICENSE-${Date.now()}`,
          license_expiry_date: new Date("2030-09-30T00:00:00.000Z"),
        },
      }),
      prisma.vehicle.create({
        data: {
          organization_id: organizationId,
          make: "Toyota",
          model: "Corolla",
          plate_number: `RENTAL-${Date.now()}`,
          year: 2020,
          color: "White",
          transmission: "AUTOMATIC",
          fuel_type: "PETROL",
          seats: 5,
          current_mileage: 1000,
          status: "AVAILABLE",
        },
      }),
      prisma.user.create({
        data: {
          organization_id: organizationId,
          email: `rental-owner-${Date.now()}@example.com`,
          password_hash: "hash",
          role: "OWNER",
        },
      }),
    ]);

    customerId = customer.id;
    vehicleId = vehicle.id;
    token = generateAccessToken({
      sub: owner.id,
      org: organizationId,
      role: "OWNER",
    });
  });

  async function createRental(
    overrides: Record<string, unknown> = {},
  ): Promise<request.Response> {
    return request(app)
      .post("/api/rentals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        customer_id: customerId,
        vehicle_id: vehicleId,
        pickup_date: "2030-01-01T09:00:00.000Z",
        expected_return_date: "2030-01-03T09:00:00.000Z",
        daily_rate: 100,
        total_amount: 200,
        deposit_amount: 50,
        ...overrides,
      });
  }

  it("amends a reserved rental using effective dates and amounts", async () => {
    const created = await createRental();

    const updated = await request(app)
      .patch(`/api/rentals/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        expected_return_date: "2030-01-04T09:00:00.000Z",
        total_amount: 300,
        deposit_amount: 75,
      });

    expect(updated.status).toBe(200);
    expect(updated.body.data.pickupDate).toBe("2030-01-01T09:00:00.000Z");
    expect(updated.body.data.expectedReturnDate).toBe(
      "2030-01-04T09:00:00.000Z",
    );
    expect(updated.body.data.totalAmount).toBe(300);
    expect(updated.body.data.depositAmount).toBe(75);
  });

  it("rejects reversed or equal amendment dates", async () => {
    const created = await createRental();

    for (const expectedReturnDate of [
      "2030-01-01T09:00:00.000Z",
      "2029-12-31T09:00:00.000Z",
    ]) {
      const response = await request(app)
        .patch(`/api/rentals/${created.body.data.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ expected_return_date: expectedReturnDate });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe("INVALID_RENTAL_PERIOD");
    }
  });

  it("rejects invalid effective amounts", async () => {
    const created = await createRental();

    const response = await request(app)
      .patch(`/api/rentals/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ deposit_amount: 201 });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("INVALID_RENTAL_AMOUNTS");
  });

  it("rejects an amendment that overlaps another live rental", async () => {
    const first = await createRental({
      pickup_date: "2030-01-01T09:00:00.000Z",
      expected_return_date: "2030-01-03T09:00:00.000Z",
    });
    const second = await createRental({
      pickup_date: "2030-01-04T09:00:00.000Z",
      expected_return_date: "2030-01-06T09:00:00.000Z",
    });

    const response = await request(app)
      .patch(`/api/rentals/${second.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ pickup_date: "2030-01-02T09:00:00.000Z" });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("VEHICLE_UNAVAILABLE");
  });

  it("rejects amendments of cancelled and returned rentals", async () => {
    const cancelled = await createRental();
    await request(app)
      .post(`/api/rentals/${cancelled.body.data.id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    const cancelledUpdate = await request(app)
      .patch(`/api/rentals/${cancelled.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ total_amount: 250 });

    const returned = await createRental();
    await request(app)
      .post(`/api/rentals/${returned.body.data.id}/pickup`)
      .set("Authorization", `Bearer ${token}`)
      .send({ actual_pickup_date: "2030-01-01T09:00:00.000Z" });
    await request(app)
      .post(`/api/rentals/${returned.body.data.id}/return`)
      .set("Authorization", `Bearer ${token}`)
      .send({ actual_return_date: "2030-01-03T09:00:00.000Z" });

    const returnedUpdate = await request(app)
      .patch(`/api/rentals/${returned.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ total_amount: 250 });

    expect(cancelledUpdate.status).toBe(409);
    expect(cancelledUpdate.body.error.code).toBe("INVALID_RENTAL_TRANSITION");
    expect(returnedUpdate.status).toBe(409);
    expect(returnedUpdate.body.error.code).toBe("INVALID_RENTAL_TRANSITION");
  });

  it("soft deletes a reserved rental and releases its vehicle", async () => {
    const created = await createRental();

    const deleted = await request(app)
      .delete(`/api/rentals/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleted.status).toBe(204);
    await expect(
      request(app)
        .get(`/api/rentals/${created.body.data.id}`)
        .set("Authorization", `Bearer ${token}`),
    ).resolves.toMatchObject({ status: 404 });

    const [rental, vehicle] = await Promise.all([
      prisma.rental.findUnique({ where: { id: created.body.data.id } }),
      prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    ]);
    expect(rental?.deleted_at).not.toBeNull();
    expect(vehicle?.status).toBe("AVAILABLE");
  });

  it("keeps the vehicle rented when another active rental still requires it", async () => {
    const active = await createRental();
    await request(app)
      .post(`/api/rentals/${active.body.data.id}/pickup`)
      .set("Authorization", `Bearer ${token}`)
      .send({ actual_pickup_date: "2030-01-01T09:00:00.000Z" });
    const futureReservation = await createRental({
      pickup_date: "2030-01-04T09:00:00.000Z",
      expected_return_date: "2030-01-06T09:00:00.000Z",
    });

    const deleted = await request(app)
      .delete(`/api/rentals/${futureReservation.body.data.id}`)
      .set("Authorization", `Bearer ${token}`);
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    expect(deleted.status).toBe(204);
    expect(vehicle?.status).toBe("RENTED");
  });

  it("rejects deletion of an active rental and preserves the vehicle lifecycle", async () => {
    const created = await createRental();
    await request(app)
      .post(`/api/rentals/${created.body.data.id}/pickup`)
      .set("Authorization", `Bearer ${token}`)
      .send({ actual_pickup_date: "2030-01-01T09:00:00.000Z" });

    const deleted = await request(app)
      .delete(`/api/rentals/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`);

    const [rental, vehicle] = await Promise.all([
      prisma.rental.findUnique({ where: { id: created.body.data.id } }),
      prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    ]);
    expect(deleted.status).toBe(409);
    expect(deleted.body.error.code).toBe("ACTIVE_RENTAL_CANNOT_BE_DELETED");
    expect(rental?.deleted_at).toBeNull();
    expect(vehicle?.status).toBe("RENTED");
  });

  it("keeps rental amendment tenant scoped", async () => {
    const otherOrganization = await prisma.organization.create({
      data: { name: "Other rental test organization" },
    });
    const otherCustomer = await prisma.customer.create({
      data: {
        organization_id: otherOrganization.id,
        first_name: "Other",
        last_name: "Customer",
        phone: "03111111",
        address: "Beirut",
        national_id: `OTHER-RENTAL-NID-${Date.now()}`,
        license_number: `OTHER-RENTAL-LICENSE-${Date.now()}`,
        license_expiry_date: new Date("2030-09-30T00:00:00.000Z"),
      },
    });
    const otherVehicle = await prisma.vehicle.create({
      data: {
        organization_id: otherOrganization.id,
        make: "Honda",
        model: "Civic",
        plate_number: `OTHER-RENTAL-${Date.now()}`,
        year: 2020,
        color: "Black",
        transmission: "AUTOMATIC",
        fuel_type: "PETROL",
        seats: 5,
        current_mileage: 1000,
        status: "AVAILABLE",
      },
    });
    const otherRental = await prisma.rental.create({
      data: {
        organization_id: otherOrganization.id,
        customer_id: otherCustomer.id,
        vehicle_id: otherVehicle.id,
        pickup_date: new Date("2030-01-01T09:00:00.000Z"),
        expected_return_date: new Date("2030-01-03T09:00:00.000Z"),
        status: "RESERVED",
        daily_rate: 100,
        total_amount: 200,
        deposit_amount: 50,
      },
    });

    const updated = await request(app)
      .patch(`/api/rentals/${otherRental.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ total_amount: 250 });
    const deleted = await request(app)
      .delete(`/api/rentals/${otherRental.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(updated.status).toBe(404);
    expect(deleted.status).toBe(404);
  });

  it("allows at most one of two concurrent conflicting amendments", async () => {
    const first = await createRental({
      pickup_date: "2030-01-01T09:00:00.000Z",
      expected_return_date: "2030-01-02T09:00:00.000Z",
    });
    const second = await createRental({
      pickup_date: "2030-01-03T09:00:00.000Z",
      expected_return_date: "2030-01-04T09:00:00.000Z",
    });

    const results = await Promise.allSettled([
      updateRental(first.body.data.id, organizationId, {
        expected_return_date: new Date("2030-01-03T09:00:00.000Z"),
      }),
      updateRental(second.body.data.id, organizationId, {
        pickup_date: new Date("2030-01-02T09:00:00.000Z"),
      }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(
      1,
    );
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
  });
});
