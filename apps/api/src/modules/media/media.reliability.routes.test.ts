import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { storageProvider } from "../../config/storage";
import { prisma } from "../../database";
import { generateAccessToken } from "../auth";
import { cleanup } from "../../test/helpers";

describe("media and signed contract storage reliability", () => {
  let organizationId: string;
  let customerId: string;
  let vehicleId: string;
  let rentalId: string;
  let token: string;

  beforeEach(async () => {
    await cleanup();

    const organization = await prisma.organization.create({
      data: { name: "Media test organization" },
    });
    organizationId = organization.id;

    const [owner, customer, vehicle] = await Promise.all([
      prisma.user.create({
        data: {
          organization_id: organizationId,
          email: `media-owner-${Date.now()}@example.com`,
          password_hash: "hash",
          role: "OWNER",
        },
      }),
      prisma.customer.create({
        data: {
          organization_id: organizationId,
          first_name: "Media",
          last_name: "Customer",
          phone: "03000000",
          address: "Beirut",
          national_id: `MEDIA-NID-${Date.now()}`,
          license_number: `MEDIA-LICENSE-${Date.now()}`,
          license_expiry_date: new Date("2030-09-30T00:00:00.000Z"),
        },
      }),
      prisma.vehicle.create({
        data: {
          organization_id: organizationId,
          make: "Toyota",
          model: "Corolla",
          plate_number: `MEDIA-${Date.now()}`,
          year: 2020,
          color: "White",
          transmission: "AUTOMATIC",
          fuel_type: "PETROL",
          seats: 5,
          current_mileage: 1000,
          status: "AVAILABLE",
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

    const rental = await prisma.rental.create({
      data: {
        organization_id: organizationId,
        customer_id: customerId,
        vehicle_id: vehicleId,
        pickup_date: new Date("2030-01-01T09:00:00.000Z"),
        expected_return_date: new Date("2030-01-03T09:00:00.000Z"),
        daily_rate: 100,
        total_amount: 200,
        deposit_amount: 50,
      },
    });
    rentalId = rental.id;

    await prisma.contract.create({
      data: {
        organization_id: organizationId,
        rental_id: rentalId,
        pickup_date: rental.pickup_date,
        expected_return_date: rental.expected_return_date,
        daily_rate: 100,
        total_amount: 200,
        deposit_amount: 50,
        customer_first_name: customer.first_name,
        customer_last_name: customer.last_name,
        customer_national_id: customer.national_id,
        vehicle_make: vehicle.make,
        vehicle_model: vehicle.model,
        vehicle_plate_number: vehicle.plate_number,
      },
    });
  });

  async function removeStoredObject(documentId: string): Promise<void> {
    const document = await prisma.document.findUniqueOrThrow({
      where: { id: documentId },
      select: { storage_key: true },
    });
    await storageProvider.delete(document.storage_key);
  }

  async function expectMissingFile(
    upload: request.Test,
    downloadPath: string,
  ): Promise<void> {
    const created = await upload;
    expect(created.status).toBe(201);
    await removeStoredObject(created.body.data.id as string);

    const downloaded = await request(app)
      .get(downloadPath.replace(":documentId", created.body.data.id as string))
      .set("Authorization", `Bearer ${token}`);

    expect(downloaded.status).toBe(404);
    expect(downloaded.body.error).toEqual({
      code: "FILE_NOT_FOUND",
      message: "The requested file is no longer available.",
    });
  }

  it("returns FILE_NOT_FOUND when a vehicle document metadata record outlives its storage object", async () => {
    await expectMissingFile(
      request(app)
        .post(`/api/vehicles/${vehicleId}/documents`)
        .set("Authorization", `Bearer ${token}`)
        .field("category", "OTHER")
        .attach("file", Buffer.from("vehicle document"), "vehicle.pdf"),
      `/api/vehicles/${vehicleId}/documents/:documentId/download`,
    );
  });

  it("returns FILE_NOT_FOUND when a customer document metadata record outlives its storage object", async () => {
    await expectMissingFile(
      request(app)
        .post(`/api/customers/${customerId}/documents`)
        .set("Authorization", `Bearer ${token}`)
        .field("category", "OTHER")
        .attach("file", Buffer.from("customer document"), "customer.pdf"),
      `/api/customers/${customerId}/documents/:documentId/download`,
    );
  });

  it("returns FILE_NOT_FOUND when a signed contract metadata record outlives its storage object", async () => {
    await expectMissingFile(
      request(app)
        .post(`/api/rentals/${rentalId}/contract/signed`)
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from("signed contract"), "signed.pdf"),
      `/api/rentals/${rentalId}/contract/signed/:documentId/download`,
    );
  });

  it("stores, returns, and updates date-only document expiry metadata", async () => {
    const created = await request(app)
      .post(`/api/vehicles/${vehicleId}/documents`)
      .set("Authorization", `Bearer ${token}`)
      .field("category", "INSURANCE")
      .field("expiryDate", "1900-01-01")
      .attach("file", Buffer.from("vehicle document"), "vehicle.pdf");

    expect(created.status).toBe(201);
    expect(created.body.data.expiryDate).toBe("1900-01-01");

    const updated = await request(app)
      .patch(`/api/vehicles/${vehicleId}/documents/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ expiryDate: "2100-12-31" });

    expect(updated.status).toBe(200);
    expect(updated.body.data.expiryDate).toBe("2100-12-31");

    const cleared = await request(app)
      .patch(`/api/vehicles/${vehicleId}/documents/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ expiryDate: null });

    expect(cleared.status).toBe(200);
    expect(cleared.body.data.expiryDate).toBeNull();
  });

  it("rejects invalid document expiry dates", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/documents`)
      .set("Authorization", `Bearer ${token}`)
      .field("category", "OTHER")
      .field("expiryDate", "2101-01-01")
      .attach("file", Buffer.from("vehicle document"), "vehicle.pdf");

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("supports customer document expiry metadata and preserves tenant isolation", async () => {
    const created = await request(app)
      .post(`/api/customers/${customerId}/documents`)
      .set("Authorization", `Bearer ${token}`)
      .field("category", "REGISTRATION")
      .field("expiryDate", "2100-12-31")
      .attach("file", Buffer.from("customer document"), "customer.pdf");

    expect(created.status).toBe(201);
    const detail = await request(app)
      .get(`/api/customers/${customerId}/documents/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.expiryDate).toBe("2100-12-31");

    const otherTenant = await prisma.organization.create({
      data: { name: "Other tenant" },
    });
    const otherCustomer = await prisma.customer.create({
      data: {
        organization_id: otherTenant.id,
        first_name: "Other",
        last_name: "Customer",
        phone: "03000001",
        address: "Beirut",
        national_id: `OTHER-${Date.now()}`,
        license_number: `OTHER-LICENSE-${Date.now()}`,
        license_expiry_date: new Date("2030-01-01T00:00:00.000Z"),
      },
    });
    const isolated = await request(app)
      .get(`/api/customers/${otherCustomer.id}/documents`)
      .set("Authorization", `Bearer ${token}`);
    expect(isolated.status).toBe(404);
    expect(isolated.body.error.code).toBe("CUSTOMER_NOT_FOUND");
  });

  it("enforces exactly one document owner at the database boundary", async () => {
    await expect(
      prisma.document.create({
        data: {
          organization_id: organizationId,
          vehicle_id: vehicleId,
          customer_id: customerId,
          category: "OTHER",
          original_filename: "invalid.pdf",
          mime_type: "application/pdf",
          file_size: 1,
          storage_key: `${organizationId}/invalid-${Date.now()}.pdf`,
        },
      }),
    ).rejects.toThrow();
  });
});
