import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { generateAccessToken } from "../../modules/auth";
import { cleanup } from "../../test/helpers";

describe("maintenance schedule routes", () => {
  let organizationId: string;
  let vehicleId: string;
  let ownerToken: string;

  beforeEach(async () => {
    await cleanup();

    const organization = await prisma.organization.create({
      data: { name: "Schedule Org" },
    });
    organizationId = organization.id;

    const owner = await prisma.user.create({
      data: {
        organization_id: organization.id,
        email: `schedule-owner-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "OWNER",
      },
    });
    ownerToken = generateAccessToken({
      sub: owner.id,
      org: organization.id,
      role: "OWNER",
    });

    const vehicle = await prisma.vehicle.create({
      data: {
        organization_id: organization.id,
        make: "Toyota",
        model: "Corolla",
        plate_number: "SCHEDULE-1",
        year: 2023,
        color: "White",
        transmission: "AUTOMATIC",
        fuel_type: "PETROL",
        seats: 5,
        current_mileage: 12000,
        status: "AVAILABLE",
      },
    });
    vehicleId = vehicle.id;
  });

  function createDateSchedule(): request.Test {
    return request(app)
      .post("/api/maintenance-schedules")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        vehicle_id: vehicleId,
        maintenance_type: "PREVENTIVE_SERVICE",
        schedule_type: "DATE",
        date_interval_days: 90,
        next_due_date: "2026-11-01",
      });
  }

  it("creates a date schedule without creating maintenance or changing availability", async () => {
    const response = await createDateSchedule();

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      vehicleId,
      maintenanceType: "PREVENTIVE_SERVICE",
      scheduleType: "DATE",
      dateIntervalDays: 90,
      nextDueDate: "2026-11-01",
      mileageInterval: null,
      nextDueMileage: null,
      isActive: true,
    });
    expect(await prisma.maintenance.count()).toBe(0);
    expect((await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId } })).status).toBe(
      "AVAILABLE",
    );
  });

  it("supports mileage and date-or-mileage schedules for the same vehicle", async () => {
    const mileage = await request(app)
      .post("/api/maintenance-schedules")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        vehicle_id: vehicleId,
        maintenance_type: "INSPECTION",
        schedule_type: "MILEAGE",
        mileage_interval: 10000,
        next_due_mileage: 20000,
      });
    const combined = await request(app)
      .post("/api/maintenance-schedules")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        vehicle_id: vehicleId,
        maintenance_type: "REPAIR",
        schedule_type: "DATE_OR_MILEAGE",
        date_interval_days: 180,
        next_due_date: "2027-01-15",
        mileage_interval: 15000,
        next_due_mileage: 27000,
      });

    expect(mileage.status).toBe(201);
    expect(combined.status).toBe(201);

    const list = await request(app)
      .get(`/api/maintenance-schedules?vehicleId=${vehicleId}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(2);
    expect(list.body.data.map((schedule: { scheduleType: string }) => schedule.scheduleType)).toEqual(
      expect.arrayContaining(["MILEAGE", "DATE_OR_MILEAGE"]),
    );
  });

  it("rejects an invalid schedule basis and invalid business date", async () => {
    const missingDateBasis = await request(app)
      .post("/api/maintenance-schedules")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        vehicle_id: vehicleId,
        maintenance_type: "INSPECTION",
        schedule_type: "DATE",
        date_interval_days: 30,
      });
    const invalidDate = await request(app)
      .post("/api/maintenance-schedules")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        vehicle_id: vehicleId,
        maintenance_type: "INSPECTION",
        schedule_type: "DATE",
        date_interval_days: 30,
        next_due_date: "2026-02-30",
      });

    expect(missingDateBasis.status).toBe(422);
    expect(missingDateBasis.body.error.code).toBe("INVALID_MAINTENANCE_SCHEDULE");
    expect(invalidDate.status).toBe(422);
    expect(invalidDate.body.error.code).toBe("INVALID_MAINTENANCE_SCHEDULE");
  });

  it("enforces schedule basis integrity in the database", async () => {
    await expect(
      prisma.maintenanceSchedule.create({
        data: {
          organization_id: organizationId,
          vehicle_id: vehicleId,
          maintenance_type: "INSPECTION",
          schedule_type: "DATE",
          date_interval_days: null,
          next_due_date: null,
          mileage_interval: null,
          next_due_mileage: null,
        },
      }),
    ).rejects.toThrow();
  });

  it("updates schedule basis and activation state", async () => {
    const created = await createDateSchedule();
    const response = await request(app)
      .patch(`/api/maintenance-schedules/${created.body.data.id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        schedule_type: "MILEAGE",
        date_interval_days: null,
        next_due_date: null,
        mileage_interval: 7500,
        next_due_mileage: 19500,
        is_active: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      scheduleType: "MILEAGE",
      dateIntervalDays: null,
      nextDueDate: null,
      mileageInterval: 7500,
      nextDueMileage: 19500,
      isActive: false,
    });
  });

  it("soft deletes a schedule and keeps it unreadable", async () => {
    const created = await createDateSchedule();
    const id = created.body.data.id as string;

    const deleted = await request(app)
      .delete(`/api/maintenance-schedules/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    const get = await request(app)
      .get(`/api/maintenance-schedules/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(deleted.status).toBe(204);
    expect(get.status).toBe(404);
    expect(await prisma.maintenance.count()).toBe(0);
  });

  it("enforces tenant isolation and owner-only schedule management", async () => {
    const created = await createDateSchedule();
    const otherOrganization = await prisma.organization.create({
      data: { name: "Other Schedule Org" },
    });
    const otherOwner = await prisma.user.create({
      data: {
        organization_id: otherOrganization.id,
        email: `other-schedule-owner-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "OWNER",
      },
    });
    const employee = await prisma.user.create({
      data: {
        organization_id: organizationId,
        email: `schedule-employee-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "EMPLOYEE",
      },
    });
    const otherToken = generateAccessToken({
      sub: otherOwner.id,
      org: otherOrganization.id,
      role: "OWNER",
    });
    const employeeToken = generateAccessToken({
      sub: employee.id,
      org: organizationId,
      role: "EMPLOYEE",
    });

    const hidden = await request(app)
      .get(`/api/maintenance-schedules/${created.body.data.id}`)
      .set("Authorization", `Bearer ${otherToken}`);
    const employeeWrite = await request(app)
      .patch(`/api/maintenance-schedules/${created.body.data.id}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ is_active: false });

    expect(hidden.status).toBe(404);
    expect(employeeWrite.status).toBe(403);
  });
});
