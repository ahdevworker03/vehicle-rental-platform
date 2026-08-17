import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../../database";
import {
  listPayments,
  listRentalPayments,
  createPayment,
} from "./payment.service";
import { cleanup, seed, type SeedOrg } from "../../test/helpers";

describe("payment service", () => {
  let ctx: SeedOrg;
  let rentalId: string;

  async function createRental(orgId: string, totalAmount: number): Promise<string> {
    const customer = await prisma.customer.create({
      data: {
        organization_id: orgId,
        first_name: "Test",
        last_name: "Customer",
        phone: "123456",
        address: "Beirut",
        national_id: `NID-${Date.now()}-${Math.random()}`,
        license_number: `LIC-${Date.now()}-${Math.random()}`,
        license_expiry_date: new Date("2030-01-01T00:00:00Z"),
      },
    });
    const vehicle = await prisma.vehicle.findFirst({
      where: { organization_id: orgId },
      select: { id: true },
    });
    if (!vehicle) throw new Error("no vehicle seeded");
    const rental = await prisma.rental.create({
      data: {
        organization_id: orgId,
        customer_id: customer.id,
        vehicle_id: vehicle.id,
        pickup_date: new Date("2026-08-01T09:00:00Z"),
        expected_return_date: new Date("2026-08-10T09:00:00Z"),
        status: "ACTIVE",
        daily_rate: 50,
        total_amount: totalAmount,
        deposit_amount: 100,
      },
    });
    return rental.id;
  }

  beforeEach(async () => {
    await cleanup();
    ctx = await seed();
    rentalId = await createRental(ctx.orgId, 500);
  });

  describe("create", () => {
    it("records a valid payment for a rental in the organization", async () => {
      const payment = await createPayment(rentalId, ctx.orgId, {
        amount: 100,
        payment_date: new Date("2026-08-02T09:00:00Z"),
        method: "CASH",
      });

      expect(payment.rentalId).toBe(rentalId);
      expect(payment.amount).toBe(100);
      expect(payment.method).toBe("CASH");
    });

    it("supports multiple payments for the same rental (partial payments)", async () => {
      await createPayment(rentalId, ctx.orgId, {
        amount: 100,
        payment_date: new Date("2026-08-02T09:00:00Z"),
        method: "CASH",
      });
      await createPayment(rentalId, ctx.orgId, {
        amount: 50,
        payment_date: new Date("2026-08-03T09:00:00Z"),
        method: "TRANSFER",
      });

      const result = await listRentalPayments(rentalId, ctx.orgId);
      expect(result.payments).toHaveLength(2);
    });

    it("rejects a payment for a rental in another organization", async () => {
      const otherRental = await createRental(ctx.otherOrgId, 100);

      await expect(
        createPayment(otherRental, ctx.orgId, {
          amount: 10,
          payment_date: new Date("2026-08-02T09:00:00Z"),
          method: "CASH",
        }),
      ).rejects.toThrow("Rental not found");
    });

    it("rejects a missing rental", async () => {
      await expect(
        createPayment("00000000-0000-0000-0000-000000000000", ctx.orgId, {
          amount: 10,
          payment_date: new Date("2026-08-02T09:00:00Z"),
          method: "CASH",
        }),
      ).rejects.toThrow("Rental not found");
    });

    it("rejects a non-positive amount", async () => {
      await expect(
        createPayment(rentalId, ctx.orgId, {
          amount: 0,
          payment_date: new Date("2026-08-02T09:00:00Z"),
          method: "CASH",
        }),
      ).rejects.toThrow("strictly greater than zero");
    });

    it("rejects a negative amount", async () => {
      await expect(
        createPayment(rentalId, ctx.orgId, {
          amount: -5,
          payment_date: new Date("2026-08-02T09:00:00Z"),
          method: "CASH",
        }),
      ).rejects.toThrow("strictly greater than zero");
    });

    it("rejects an invalid payment method", async () => {
      await expect(
        createPayment(rentalId, ctx.orgId, {
          amount: 10,
          payment_date: new Date("2026-08-02T09:00:00Z"),
          method: "STRIPE" as never,
        }),
      ).rejects.toThrow("Invalid payment method");
    });
  });

  describe("list for a rental", () => {
    it("returns only that rental's payments", async () => {
      const otherRental = await createRental(ctx.orgId, 300);

      await createPayment(rentalId, ctx.orgId, {
        amount: 100,
        payment_date: new Date("2026-08-02T09:00:00Z"),
        method: "CASH",
      });
      await createPayment(otherRental, ctx.orgId, {
        amount: 50,
        payment_date: new Date("2026-08-02T09:00:00Z"),
        method: "CARD",
      });

      const result = await listRentalPayments(rentalId, ctx.orgId);
      expect(result.payments).toHaveLength(1);
      expect(result.payments[0].amount).toBe(100);
    });

    it("returns 404 for a rental in another organization", async () => {
      const otherRental = await createRental(ctx.otherOrgId, 100);

      await expect(
        listRentalPayments(otherRental, ctx.orgId),
      ).rejects.toThrow("Rental not found");
    });

    it("derives outstanding balance as total minus active payments", async () => {
      await createPayment(rentalId, ctx.orgId, {
        amount: 100,
        payment_date: new Date("2026-08-02T09:00:00Z"),
        method: "CASH",
      });
      await createPayment(rentalId, ctx.orgId, {
        amount: 50,
        payment_date: new Date("2026-08-03T09:00:00Z"),
        method: "TRANSFER",
      });

      const result = await listRentalPayments(rentalId, ctx.orgId);
      expect(result.outstandingBalance).toBe(500 - 150);
    });

    it("derives the balance exactly using Decimal arithmetic (1.00 - 0.10 - 0.20 = 0.70)", async () => {
      const smallRental = await createRental(ctx.orgId, 1);
      await createPayment(smallRental, ctx.orgId, {
        amount: 0.1,
        payment_date: new Date("2026-08-02T09:00:00Z"),
        method: "CASH",
      });
      await createPayment(smallRental, ctx.orgId, {
        amount: 0.2,
        payment_date: new Date("2026-08-03T09:00:00Z"),
        method: "TRANSFER",
      });

      const result = await listRentalPayments(smallRental, ctx.orgId);
      expect(result.outstandingBalance).toBe(0.7);
      expect(result.outstandingBalance).toBeGreaterThan(0.69);
      expect(result.outstandingBalance).toBeLessThan(0.71);
    });

    it("excludes soft-deleted payments from the balance", async () => {
      const payment = await createPayment(rentalId, ctx.orgId, {
        amount: 100,
        payment_date: new Date("2026-08-02T09:00:00Z"),
        method: "CASH",
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { deleted_at: new Date() },
      });

      const result = await listRentalPayments(rentalId, ctx.orgId);
      expect(result.payments).toHaveLength(0);
      expect(result.outstandingBalance).toBe(500);
    });
  });

  describe("list organization-wide", () => {
    it("returns only the organization's payments", async () => {
      const otherRental = await createRental(ctx.orgId, 300);

      await createPayment(rentalId, ctx.orgId, {
        amount: 100,
        payment_date: new Date("2026-08-02T09:00:00Z"),
        method: "CASH",
      });
      await createPayment(otherRental, ctx.orgId, {
        amount: 50,
        payment_date: new Date("2026-08-02T09:00:00Z"),
        method: "CARD",
      });

      const payments = await listPayments(ctx.orgId);
      expect(payments).toHaveLength(2);
    });

    it("does not include another organization's payments", async () => {
      const otherRental = await createRental(ctx.otherOrgId, 100);
      await createPayment(otherRental, ctx.otherOrgId, {
        amount: 999,
        payment_date: new Date("2026-08-02T09:00:00Z"),
        method: "CASH",
      });

      const payments = await listPayments(ctx.orgId);
      expect(payments).toHaveLength(0);
    });
  });
});
