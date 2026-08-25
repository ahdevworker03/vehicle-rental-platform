import { prisma } from "../../database";
import type { TxClient } from "../../database";
import type {
  ContractRecord,
  ContractDocumentRecord,
  DocumentCategory,
} from "./contract.types";

type DbClient = typeof prisma | TxClient;

interface ContractSnapshotInput {
  organization_id: string;
  rental_id: string;
  pickup_date: Date;
  expected_return_date: Date;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_national_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate_number: string;
}

async function findActiveByRental(
  rentalId: string,
  orgId: string,
): Promise<ContractRecord | null> {
  return prisma.contract.findFirst({
    where: {
      rental_id: rentalId,
      organization_id: orgId,
      deleted_at: null,
    },
  });
}

async function findByRentalWithinTx(
  rentalId: string,
  orgId: string,
  tx: DbClient,
): Promise<ContractRecord | null> {
  return tx.contract.findFirst({
    where: { rental_id: rentalId, organization_id: orgId },
  });
}

async function findRentalWithRelationsWithinTx(
  rentalId: string,
  orgId: string,
  tx: DbClient,
): Promise<{
  rental: {
    id: string;
    organization_id: string;
    pickup_date: Date;
    expected_return_date: Date;
    daily_rate: { toString(): string };
    total_amount: { toString(): string };
    deposit_amount: { toString(): string };
    status: string;
  } | null;
  customer: {
    first_name: string;
    last_name: string;
    national_id: string;
  } | null;
  vehicle: { make: string; model: string; plate_number: string } | null;
}> {
  const rental = await tx.rental.findFirst({
    where: { id: rentalId, organization_id: orgId, deleted_at: null },
    include: {
      customer: true,
      vehicle: true,
    },
  });

  if (!rental) {
    return { rental: null, customer: null, vehicle: null };
  }

  return {
    rental: {
      id: rental.id,
      organization_id: rental.organization_id,
      pickup_date: rental.pickup_date,
      expected_return_date: rental.expected_return_date,
      daily_rate: rental.daily_rate,
      total_amount: rental.total_amount,
      deposit_amount: rental.deposit_amount,
      status: rental.status,
    },
    customer: rental.customer
      ? {
          first_name: rental.customer.first_name,
          last_name: rental.customer.last_name,
          national_id: rental.customer.national_id,
        }
      : null,
    vehicle: rental.vehicle
      ? {
          make: rental.vehicle.make,
          model: rental.vehicle.model,
          plate_number: rental.vehicle.plate_number,
        }
      : null,
  };
}

async function createWithinTx(
  data: ContractSnapshotInput,
  tx: DbClient,
): Promise<ContractRecord> {
  return tx.contract.create({ data });
}

async function restoreAndReplaceWithinTx(
  contractId: string,
  data: ContractSnapshotInput,
  tx: DbClient,
): Promise<ContractRecord> {
  return tx.contract.update({
    where: { id: contractId },
    data: { ...data, deleted_at: null },
  });
}

async function softDelete(contractId: string): Promise<ContractRecord> {
  return prisma.contract.update({
    where: { id: contractId },
    data: { deleted_at: new Date() },
  });
}

async function hasDocumentsWithinTx(
  contractId: string,
  orgId: string,
  tx: DbClient,
): Promise<boolean> {
  return (await tx.document.count({
    where: { contract_id: contractId, organization_id: orgId },
  })) > 0;
}

async function listDocuments(
  contractId: string,
  orgId: string,
): Promise<ContractDocumentRecord[]> {
  return prisma.document.findMany({
    where: {
      contract_id: contractId,
      organization_id: orgId,
      deleted_at: null,
    },
    orderBy: { created_at: "desc" },
  });
}

async function findDocument(
  documentId: string,
  contractId: string,
  orgId: string,
): Promise<ContractDocumentRecord | null> {
  return prisma.document.findFirst({
    where: { id: documentId, contract_id: contractId, organization_id: orgId },
  });
}

async function createDocument(data: {
  organization_id: string;
  contract_id: string;
  category: DocumentCategory;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_key: string;
}): Promise<ContractDocumentRecord> {
  return prisma.document.create({ data });
}

async function softDeleteDocument(
  documentId: string,
): Promise<ContractDocumentRecord> {
  return prisma.document.update({
    where: { id: documentId },
    data: { deleted_at: new Date() },
  });
}

export {
  findActiveByRental,
  findByRentalWithinTx,
  findRentalWithRelationsWithinTx,
  createWithinTx,
  restoreAndReplaceWithinTx,
  softDelete,
  hasDocumentsWithinTx,
  listDocuments,
  findDocument,
  createDocument,
  softDeleteDocument,
};
