import { prisma } from "../../database";
import type { TxClient } from "../../database";
import type { RentalRecord, RentalStatus, VehicleStatus } from "./rental.types";

type DbClient = typeof prisma | TxClient;

async function findByOrg(orgId: string): Promise<RentalRecord[]> {
  return prisma.rental.findMany({
    where: { organization_id: orgId, deleted_at: null },
    orderBy: { created_at: "desc" },
  });
}

async function searchByOrg(orgId: string, term: string): Promise<RentalRecord[]> {
  return prisma.rental.findMany({
    where: {
      organization_id: orgId,
      deleted_at: null,
      OR: [
        { customer: { first_name: { contains: term, mode: "insensitive" } } },
        { customer: { last_name: { contains: term, mode: "insensitive" } } },
        { vehicle: { make: { contains: term, mode: "insensitive" } } },
        { vehicle: { model: { contains: term, mode: "insensitive" } } },
        { vehicle: { plate_number: { contains: term, mode: "insensitive" } } },
      ],
    },
    orderBy: { created_at: "desc" },
  });
}

async function findById(rentalId: string, orgId: string): Promise<RentalRecord | null> {
  return prisma.rental.findFirst({
    where: { id: rentalId, organization_id: orgId },
  });
}

async function findByIdWithinTx(rentalId: string, orgId: string, tx: DbClient): Promise<RentalRecord | null> {
  return tx.rental.findFirst({
    where: { id: rentalId, organization_id: orgId },
  });
}

async function findCustomer(customerId: string, orgId: string): Promise<{ id: string } | null> {
  return prisma.customer.findFirst({
    where: { id: customerId, organization_id: orgId, deleted_at: null },
    select: { id: true },
  });
}

async function findCustomerWithinTx(customerId: string, orgId: string, tx: DbClient): Promise<{ id: string } | null> {
  return tx.customer.findFirst({
    where: { id: customerId, organization_id: orgId, deleted_at: null },
    select: { id: true },
  });
}

async function findVehicle(vehicleId: string, orgId: string): Promise<{ id: string; status: string } | null> {
  return prisma.vehicle.findFirst({
    where: { id: vehicleId, organization_id: orgId, deleted_at: null },
    select: { id: true, status: true },
  });
}

async function findVehicleWithinTx(vehicleId: string, orgId: string, tx: DbClient): Promise<{ id: string; status: string } | null> {
  return tx.vehicle.findFirst({
    where: { id: vehicleId, organization_id: orgId, deleted_at: null },
    select: { id: true, status: true },
  });
}

async function findOverlapping(
  vehicleId: string,
  orgId: string,
  pickupDate: Date,
  expectedReturnDate: Date,
  excludeRentalId?: string,
): Promise<RentalRecord[]> {
  return prisma.rental.findMany({
    where: {
      vehicle_id: vehicleId,
      organization_id: orgId,
      deleted_at: null,
      status: { in: ["RESERVED", "ACTIVE"] },
      pickup_date: { lt: expectedReturnDate },
      expected_return_date: { gt: pickupDate },
      ...(excludeRentalId ? { id: { not: excludeRentalId } } : {}),
    },
  });
}

async function findOverlappingWithinTx(
  vehicleId: string,
  orgId: string,
  pickupDate: Date,
  expectedReturnDate: Date,
  excludeRentalId: string | undefined,
  tx: DbClient,
): Promise<RentalRecord[]> {
  return tx.rental.findMany({
    where: {
      vehicle_id: vehicleId,
      organization_id: orgId,
      deleted_at: null,
      status: { in: ["RESERVED", "ACTIVE"] },
      pickup_date: { lt: expectedReturnDate },
      expected_return_date: { gt: pickupDate },
      ...(excludeRentalId ? { id: { not: excludeRentalId } } : {}),
    },
  });
}

async function create(data: {
  organization_id: string;
  customer_id: string;
  vehicle_id: string;
  pickup_date: Date;
  expected_return_date: Date;
  status: RentalStatus;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
}): Promise<RentalRecord> {
  return prisma.rental.create({ data });
}

async function createWithinTx(
  data: {
    organization_id: string;
    customer_id: string;
    vehicle_id: string;
    pickup_date: Date;
    expected_return_date: Date;
    status: RentalStatus;
    daily_rate: number;
    total_amount: number;
    deposit_amount: number;
  },
  tx: DbClient,
): Promise<RentalRecord> {
  return tx.rental.create({ data });
}

async function update(rentalId: string, data: {
  pickup_date?: Date;
  expected_return_date?: Date;
  actual_pickup_date?: Date | null;
  actual_return_date?: Date | null;
  status?: RentalStatus;
  daily_rate?: number;
  total_amount?: number;
  deposit_amount?: number;
}): Promise<RentalRecord> {
  return prisma.rental.update({
    where: { id: rentalId },
    data,
  });
}

async function updateWithinTx(
  rentalId: string,
  data: {
    pickup_date?: Date;
    expected_return_date?: Date;
    actual_pickup_date?: Date | null;
    actual_return_date?: Date | null;
    status?: RentalStatus;
    daily_rate?: number;
    total_amount?: number;
    deposit_amount?: number;
  },
  tx: DbClient,
): Promise<RentalRecord> {
  return tx.rental.update({
    where: { id: rentalId },
    data,
  });
}

async function updateVehicleStatus(vehicleId: string, status: VehicleStatus): Promise<void> {
  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status },
  });
}

async function updateVehicleStatusWithinTx(vehicleId: string, status: VehicleStatus, tx: DbClient): Promise<void> {
  await tx.vehicle.update({
    where: { id: vehicleId },
    data: { status },
  });
}

async function softDelete(rentalId: string): Promise<RentalRecord> {
  return prisma.rental.update({
    where: { id: rentalId },
    data: { deleted_at: new Date() },
  });
}

export {
  findByOrg,
  searchByOrg,
  findById,
  findByIdWithinTx,
  findCustomer,
  findCustomerWithinTx,
  findVehicle,
  findVehicleWithinTx,
  findOverlapping,
  findOverlappingWithinTx,
  create,
  createWithinTx,
  update,
  updateWithinTx,
  updateVehicleStatus,
  updateVehicleStatusWithinTx,
  softDelete,
};
