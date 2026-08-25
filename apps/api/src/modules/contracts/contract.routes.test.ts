import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../database";
import { generateAccessToken } from "../auth";
import { cleanup } from "../../test/helpers";

describe("contract lifecycle", () => {
  let organizationId: string;
  let customerId: string;
  let vehicleId: string;
  let rentalId: string;
  let token: string;

  beforeEach(async () => {
    await cleanup();

    const organization = await prisma.organization.create({
      data: { name: "Contract test organization" },
    });
    organizationId = organization.id;

    const [owner, customer, vehicle] = await Promise.all([
      prisma.user.create({
        data: {
          organization_id: organizationId,
          email: `contract-owner-${Date.now()}@example.com`,
          password_hash: "hash",
          role: "OWNER",
        },
      }),
      prisma.customer.create({
        data: {
          organization_id: organizationId,
          first_name: "Contract",
          last_name: "Customer",
          phone: "03000000",
          address: "Beirut",
          national_id: `CONTRACT-NID-${Date.now()}`,
          license_number: `CONTRACT-LICENSE-${Date.now()}`,
          license_expiry_date: new Date("2030-09-30T00:00:00.000Z"),
        },
      }),
      prisma.vehicle.create({
        data: {
          organization_id: organizationId,
          make: "Toyota",
          model: "Corolla",
          plate_number: `CONTRACT-${Date.now()}`,
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
  });

  function generateContract() {
    return request(app)
      .post(`/api/rentals/${rentalId}/contract`)
      .set("Authorization", `Bearer ${token}`);
  }

  function deleteContract() {
    return request(app)
      .delete(`/api/rentals/${rentalId}/contract`)
      .set("Authorization", `Bearer ${token}`);
  }

  it("restores the same unsigned contract row with a refreshed rental snapshot", async () => {
    const generated = await generateContract();
    expect(generated.status).toBe(201);
    const contractId = generated.body.data.id as string;

    await prisma.rental.update({
      where: { id: rentalId },
      data: {
        expected_return_date: new Date("2030-01-04T09:00:00.000Z"),
        total_amount: 300,
      },
    });

    expect((await deleteContract()).status).toBe(204);

    for (const path of [
      `/api/rentals/${rentalId}/contract`,
      `/api/rentals/${rentalId}/contract/printable`,
      `/api/rentals/${rentalId}/contract/pdf`,
    ]) {
      const response = await request(app)
        .get(path)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("CONTRACT_NOT_FOUND");
    }

    const regenerated = await generateContract();
    expect(regenerated.status).toBe(201);
    expect(regenerated.body.data.id).toBe(contractId);
    expect(regenerated.body.data.expectedReturnDate).toBe(
      "2030-01-04T09:00:00.000Z",
    );
    expect(regenerated.body.data.totalAmount).toBe(300);

    const restored = await prisma.contract.findUniqueOrThrow({
      where: { id: contractId },
    });
    expect(restored.deleted_at).toBeNull();
    expect(restored.total_amount.toString()).toBe("300");
  });

  it("rejects regeneration when the deleted contract retains a signed document", async () => {
    const generated = await generateContract();
    const contractId = generated.body.data.id as string;

    await prisma.document.create({
      data: {
        organization_id: organizationId,
        contract_id: contractId,
        category: "OTHER",
        original_filename: "signed.pdf",
        mime_type: "application/pdf",
        file_size: 1,
        storage_key: `signed-contract-${Date.now()}.pdf`,
      },
    });
    expect((await deleteContract()).status).toBe(204);

    const regenerated = await generateContract();
    expect(regenerated.status).toBe(409);
    expect(regenerated.body.error.code).toBe("SIGNED_CONTRACT_EXISTS");

    const contract = await prisma.contract.findUniqueOrThrow({
      where: { id: contractId },
    });
    expect(contract.deleted_at).not.toBeNull();
  });

  it("does not expose or regenerate another organization contract", async () => {
    const otherOrganization = await prisma.organization.create({
      data: { name: "Other contract organization" },
    });
    const otherOwner = await prisma.user.create({
      data: {
        organization_id: otherOrganization.id,
        email: `other-contract-owner-${Date.now()}@example.com`,
        password_hash: "hash",
        role: "OWNER",
      },
    });
    const otherToken = generateAccessToken({
      sub: otherOwner.id,
      org: otherOrganization.id,
      role: "OWNER",
    });
    expect((await generateContract()).status).toBe(201);

    const response = await request(app)
      .post(`/api/rentals/${rentalId}/contract`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("RENTAL_NOT_FOUND");
  });

  it("keeps concurrent generation attempts to one active contract", async () => {
    const responses = await Promise.all([
      generateContract(),
      generateContract(),
    ]);

    expect(responses.filter((response) => response.status === 201)).toHaveLength(1);
    expect(responses.filter((response) => response.status === 409)).toHaveLength(1);
    expect(
      await prisma.contract.count({
        where: {
          rental_id: rentalId,
          organization_id: organizationId,
          deleted_at: null,
        },
      }),
    ).toBe(1);
  });
});
