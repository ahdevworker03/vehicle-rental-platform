import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { generateAccessToken } from "../auth";
import { cleanup } from "../../test/helpers";

describe("customer routes", () => {
  let organizationId: string;
  let token: string;

  beforeEach(async () => {
    await cleanup();

    const organization = await prisma.organization.create({
      data: { name: "Customer test organization" },
    });
    organizationId = organization.id;

    const owner = await prisma.user.create({
      data: {
        organization_id: organizationId,
        email: `customer-owner-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "OWNER",
      },
    });
    token = generateAccessToken({
      sub: owner.id,
      org: organizationId,
      role: "OWNER",
    });
  });

  function customerPayload(overrides: Record<string, unknown> = {}) {
    const unique = `${Date.now()}-${Math.random()}`;

    return {
      first_name: "Test",
      last_name: "Customer",
      phone: "03000000",
      address: "Beirut",
      national_id: `NID-${unique}`,
      license_number: `LIC-${unique}`,
      license_expiry_date: "2030-09-30T00:00:00.000Z",
      ...overrides,
    };
  }

  async function createCustomer(overrides: Record<string, unknown> = {}) {
    return request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${token}`)
      .send(customerPayload(overrides));
  }

  it("lists and gets a customer with a supported licence expiry date", async () => {
    const created = await createCustomer({
      license_expiry_date: "1900-01-01T00:00:00.000Z",
    });

    expect(created.status).toBe(201);
    expect(created.body.data.licenseExpiryDate).toBe(
      "1900-01-01T00:00:00.000Z",
    );

    const list = await request(app)
      .get("/api/customers")
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const detail = await request(app)
      .get(`/api/customers/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.licenseExpiryDate).toBe(
      "1900-01-01T00:00:00.000Z",
    );
  });

  it("accepts the maximum supported licence expiry date on update", async () => {
    const created = await createCustomer();

    const updated = await request(app)
      .patch(`/api/customers/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(
        customerPayload({
          license_expiry_date: "2100-12-31T23:59:59.999Z",
        }),
      );

    expect(updated.status).toBe(200);
    expect(updated.body.data.licenseExpiryDate).toBe(
      "2100-12-31T23:59:59.999Z",
    );
  });

  it("rejects licence expiry dates outside the supported range", async () => {
    for (const licenseExpiryDate of [
      "1899-12-31T23:59:59.999Z",
      "2101-01-01T00:00:00.000Z",
    ]) {
      const response = await createCustomer({
        license_expiry_date: licenseExpiryDate,
      });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("rejects an invalid licence expiry date", async () => {
    const response = await createCustomer({
      license_expiry_date: "not-a-date",
    });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("enforces the licence expiry range in the database", async () => {
    const created = await createCustomer();

    await expect(
      prisma.customer.update({
        where: { id: created.body.data.id },
        data: {
          license_expiry_date: new Date("2101-01-01T00:00:00.000Z"),
        },
      }),
    ).rejects.toMatchObject({ code: "P2039" });

    const detail = await request(app)
      .get(`/api/customers/${created.body.data.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(detail.status).toBe(200);
    expect(detail.body.data.licenseExpiryDate).toBe(
      "2030-09-30T00:00:00.000Z",
    );
  });

  it("does not expose another organization customer", async () => {
    const otherOrganization = await prisma.organization.create({
      data: { name: "Other customer test organization" },
    });
    const otherCustomer = await prisma.customer.create({
      data: {
        organization_id: otherOrganization.id,
        first_name: "Other",
        last_name: "Customer",
        phone: "03111111",
        address: "Beirut",
        national_id: `OTHER-NID-${Date.now()}`,
        license_number: `OTHER-LIC-${Date.now()}`,
        license_expiry_date: new Date("2030-09-30T00:00:00.000Z"),
      },
    });

    const response = await request(app)
      .get(`/api/customers/${otherCustomer.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
