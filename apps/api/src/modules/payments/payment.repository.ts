import { prisma } from "../../database";
import type { Decimal } from "@prisma/client/runtime/client";
import type {
  PaymentRecord,
  PaymentMethod,
} from "./payment.types";

async function findById(
  paymentId: string,
  orgId: string,
): Promise<PaymentRecord | null> {
  return prisma.payment.findFirst({
    where: { id: paymentId, organization_id: orgId },
  });
}

async function findRental(
  rentalId: string,
  orgId: string,
): Promise<{ id: string; total_amount: Decimal } | null> {
  return prisma.rental.findFirst({
    where: { id: rentalId, organization_id: orgId, deleted_at: null },
    select: { id: true, total_amount: true },
  });
}

async function findByRental(
  rentalId: string,
  orgId: string,
): Promise<PaymentRecord[]> {
  return prisma.payment.findMany({
    where: { rental_id: rentalId, organization_id: orgId, deleted_at: null },
    orderBy: { payment_date: "desc" },
  });
}

async function findByOrg(orgId: string): Promise<PaymentRecord[]> {
  return prisma.payment.findMany({
    where: { organization_id: orgId, deleted_at: null },
    orderBy: { payment_date: "desc" },
  });
}

async function create(data: {
  organization_id: string;
  rental_id: string;
  amount: number;
  payment_date: Date;
  method: PaymentMethod;
}): Promise<PaymentRecord> {
  return prisma.payment.create({ data });
}

export {
  findById,
  findRental,
  findByRental,
  findByOrg,
  create,
};
