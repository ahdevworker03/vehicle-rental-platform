import { prisma } from "../../database";
import type {
  PhotoRecord,
  DocumentRecord,
  DocumentCategory,
} from "./media.types";

async function findVehicle(
  vehicleId: string,
  orgId: string,
): Promise<{ id: string } | null> {
  return prisma.vehicle.findFirst({
    where: { id: vehicleId, organization_id: orgId, deleted_at: null },
    select: { id: true },
  });
}

async function findCustomer(
  customerId: string,
  orgId: string,
): Promise<{ id: string } | null> {
  return prisma.customer.findFirst({
    where: { id: customerId, organization_id: orgId, deleted_at: null },
    select: { id: true },
  });
}

async function listPhotos(
  vehicleId: string,
  orgId: string,
): Promise<PhotoRecord[]> {
  return prisma.photo.findMany({
    where: { vehicle_id: vehicleId, organization_id: orgId, deleted_at: null },
    orderBy: { sort_order: "asc" },
  });
}

async function findPhoto(
  photoId: string,
  vehicleId: string,
  orgId: string,
): Promise<PhotoRecord | null> {
  return prisma.photo.findFirst({
    where: { id: photoId, vehicle_id: vehicleId, organization_id: orgId },
  });
}

async function createPhoto(data: {
  organization_id: string;
  vehicle_id: string;
  sort_order: number;
  caption: string | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_key: string;
}): Promise<PhotoRecord> {
  return prisma.photo.create({ data });
}

async function softDeletePhoto(photoId: string): Promise<PhotoRecord> {
  return prisma.photo.update({
    where: { id: photoId },
    data: { deleted_at: new Date() },
  });
}

async function listDocuments(
  vehicleId: string,
  orgId: string,
): Promise<DocumentRecord[]> {
  return prisma.document.findMany({
    where: { vehicle_id: vehicleId, organization_id: orgId, deleted_at: null },
    orderBy: { created_at: "desc" },
  });
}

async function findDocument(
  documentId: string,
  vehicleId: string,
  orgId: string,
): Promise<DocumentRecord | null> {
  return prisma.document.findFirst({
    where: { id: documentId, vehicle_id: vehicleId, organization_id: orgId },
  });
}

async function createDocument(data: {
  organization_id: string;
  vehicle_id: string;
  category: DocumentCategory;
  expiry_date?: Date | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_key: string;
}): Promise<DocumentRecord> {
  return prisma.document.create({ data });
}

async function listCustomerDocuments(
  customerId: string,
  orgId: string,
): Promise<DocumentRecord[]> {
  return prisma.document.findMany({
    where: {
      customer_id: customerId,
      organization_id: orgId,
      deleted_at: null,
    },
    orderBy: { created_at: "desc" },
  });
}

async function findCustomerDocument(
  documentId: string,
  customerId: string,
  orgId: string,
): Promise<DocumentRecord | null> {
  return prisma.document.findFirst({
    where: { id: documentId, customer_id: customerId, organization_id: orgId },
  });
}

async function createCustomerDocument(data: {
  organization_id: string;
  customer_id: string;
  category: DocumentCategory;
  expiry_date?: Date | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_key: string;
}): Promise<DocumentRecord> {
  return prisma.document.create({ data });
}

async function updateDocumentExpiry(
  documentId: string,
  orgId: string,
  owner: { vehicle_id?: string; customer_id?: string },
  expiryDate: Date | null,
): Promise<DocumentRecord> {
  const result = await prisma.document.updateMany({
    where: { id: documentId, organization_id: orgId, ...owner },
    data: { expiry_date: expiryDate },
  });
  if (result.count !== 1) {
    throw new Error("Document update lost its tenant scope.");
  }
  const record = await prisma.document.findFirst({
    where: { id: documentId, organization_id: orgId, ...owner },
  });
  if (!record) throw new Error("Document update lost its tenant scope.");
  return record;
}

async function softDeleteDocument(documentId: string): Promise<DocumentRecord> {
  return prisma.document.update({
    where: { id: documentId },
    data: { deleted_at: new Date() },
  });
}

export {
  findVehicle,
  findCustomer,
  listPhotos,
  findPhoto,
  createPhoto,
  softDeletePhoto,
  listDocuments,
  findDocument,
  createDocument,
  listCustomerDocuments,
  findCustomerDocument,
  createCustomerDocument,
  updateDocumentExpiry,
  softDeleteDocument,
};
