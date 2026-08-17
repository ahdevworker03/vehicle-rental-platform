import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { generateAccessToken } from "../../modules/auth";
import { cleanup } from "../../test/helpers";

describe("payment routes", () => {
  let rentalId: string;
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
        plate_number: `API-PAY-${Date.now()}`,
        year: 2020,
        color: "White",
        transmission: "AUTOMATIC",
        fuel_type: "PETROL",
        seats: 5,
        current_mileage: 1000,
        status: "AVAILABLE",
      },
    });

    const customer = await prisma.customer.create({
      data: {
        organization_id: org.id,
        first_name: "Test",
        last_name: "Customer",
        phone: "123456",
        address: "Beirut",
        national_id: `NID-${Date.now()}`,
        license_number: `LIC-${Date.now()}`,
        license_expiry_date: new Date("2030-01-01T00:00:00Z"),
      },
    });

    const rental = await prisma.rental.create({
      data: {
        organization_id: org.id,
        customer_id: customer.id,
        vehicle_id: vehicle.id,
        pickup_date: new Date("2026-08-01T09:00:00Z"),
        expected_return_date: new Date("2026-08-10T09:00:00Z"),
        status: "ACTIVE",
        daily_rate: 50,
        total_amount: 500,
        deposit_amount: 100,
      },
    });
    rentalId = rental.id;

    token = generateAccessToken({
      sub: user.id,
      org: org.id,
      role: "OWNER",
    });
  });

  it("records a payment via the API", async () => {
    const res = await request(app)
      .post(`/api/rentals/${rentalId}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 100,
        payment_date: "2026-08-02T09:00:00Z",
        method: "CASH",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.rentalId).toBe(rentalId);
    expect(res.body.data.amount).toBe(100);
    expect(res.body.data.method).toBe("CASH");
  });

  it("rejects an unauthenticated request", async () => {
    const res = await request(app).get("/api/payments");
    expect(res.status).toBe(401);
  });

  it("lists a rental's payments with derived outstanding balance", async () => {
    await request(app)
      .post(`/api/rentals/${rentalId}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 100,
        payment_date: "2026-08-02T09:00:00Z",
        method: "CASH",
      });

    const res = await request(app)
      .get(`/api/rentals/${rentalId}/payments`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.payments).toHaveLength(1);
    expect(res.body.data.outstandingBalance).toBe(400);
  });

  it("lists payments organization-wide", async () => {
    await request(app)
      .post(`/api/rentals/${rentalId}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 50,
        payment_date: "2026-08-02T09:00:00Z",
        method: "CASH",
      });

    const res = await request(app)
      .get("/api/payments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].amount).toBe(50);
  });

  it("rejects a non-positive amount via validation", async () => {
    const res = await request(app)
      .post(`/api/rentals/${rentalId}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 0,
        payment_date: "2026-08-02T09:00:00Z",
        method: "CASH",
      });

    expect(res.status).toBe(422);
  });

  it("rejects an invalid payment method via validation", async () => {
    const res = await request(app)
      .post(`/api/rentals/${rentalId}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 100,
        payment_date: "2026-08-02T09:00:00Z",
        method: "STRIPE",
      });

    expect(res.status).toBe(422);
  });

  it("rejects a payment for a rental in another organization", async () => {
    const otherOrg = await prisma.organization.create({
      data: { name: "Org B" },
    });
    const otherVehicle = await prisma.vehicle.create({
      data: {
        organization_id: otherOrg.id,
        make: "Nissan",
        model: "Sunny",
        plate_number: `API-PAY-2-${Date.now()}`,
        year: 2018,
        color: "Blue",
        transmission: "MANUAL",
        fuel_type: "PETROL",
        seats: 5,
        current_mileage: 3000,
        status: "AVAILABLE",
      },
    });
    const otherCustomer = await prisma.customer.create({
      data: {
        organization_id: otherOrg.id,
        first_name: "Other",
        last_name: "Customer",
        phone: "654321",
        address: "Tripoli",
        national_id: `NID-O-${Date.now()}`,
        license_number: `LIC-O-${Date.now()}`,
        license_expiry_date: new Date("2030-01-01T00:00:00Z"),
      },
    });
    const otherRental = await prisma.rental.create({
      data: {
        organization_id: otherOrg.id,
        customer_id: otherCustomer.id,
        vehicle_id: otherVehicle.id,
        pickup_date: new Date("2026-08-01T09:00:00Z"),
        expected_return_date: new Date("2026-08-10T09:00:00Z"),
        status: "ACTIVE",
        daily_rate: 50,
        total_amount: 100,
        deposit_amount: 50,
      },
    });

    const res = await request(app)
      .post(`/api/rentals/${otherRental.id}/payments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 10,
        payment_date: "2026-08-02T09:00:00Z",
        method: "CASH",
      });

    expect(res.status).toBe(404);
  });
});
