import { prisma } from "../../database";
import type { RentalRecord, RentalStatus } from "./rental.types";

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

async function findCustomer(customerId: string, orgId: string): Promise<{ id: string } | null> {
  return prisma.customer.findFirst({
    where: { id: customerId, organization_id: orgId, deleted_at: null },
    select: { id: true },
  });
}

async function findVehicle(vehicleId: string, orgId: string): Promise<{ id: string } | null> {
  return prisma.vehicle.findFirst({
    where: { id: vehicleId, organization_id: orgId, deleted_at: null },
    select: { id: true },
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

async function update(rentalId: string, data: {
  pickup_date?: Date;
  expected_return_date?: Date;
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

async function softDelete(rentalId: string): Promise<RentalRecord> {
  return prisma.rental.update({
    where: { id: rentalId },
    data: { deleted_at: new Date() },
  });
}

export { findByOrg, searchByOrg, findById, findCustomer, findVehicle, create, update, softDelete };
