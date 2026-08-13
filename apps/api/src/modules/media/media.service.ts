import { randomUUID } from "node:crypto";
import { AppError } from "../../shared";
import { storageProvider } from "../../config/storage";
import * as repo from "./media.repository";
import { MAX_FILE_SIZE, isPhotoMimeType, isDocumentMimeType, extensionForMimeType } from "./media.validation";
import type { PhotoResponse, DocumentResponse, CreatePhotoInput, CreateDocumentInput, DocumentCategory } from "./media.types";

function generateStorageKey(
  orgId: string,
  entity: "vehicle" | "customer",
  mimeType: string,
): string {
  const extension = extensionForMimeType(mimeType);
  return `${orgId}/${entity}/${randomUUID()}.${extension}`;
}

function sanitizeFilename(filename: string): string {
  const withoutPath = filename.split(/[\\/]/).pop() ?? filename;
  return withoutPath.trim();
}

function toPhotoResponse(record: {
  id: string;
  vehicle_id: string;
  sort_order: number;
  caption: string | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_key: string;
  created_at: Date;
  updated_at: Date;
}): PhotoResponse {
  return {
    id: record.id,
    vehicleId: record.vehicle_id,
    sortOrder: record.sort_order,
    caption: record.caption,
    originalFilename: record.original_filename,
    mimeType: record.mime_type,
    fileSize: record.file_size,
    url: `/api/vehicles/${record.vehicle_id}/photos/${record.id}/serve`,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

function toDocumentResponse(record: {
  id: string;
  vehicle_id: string | null;
  customer_id: string | null;
  category: DocumentCategory;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_key: string;
  created_at: Date;
  updated_at: Date;
}): DocumentResponse {
  return {
    id: record.id,
    vehicleId: record.vehicle_id,
    customerId: record.customer_id,
    category: record.category,
    originalFilename: record.original_filename,
    mimeType: record.mime_type,
    fileSize: record.file_size,
    url: record.storage_key,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

async function ensureVehicleInOrg(vehicleId: string, orgId: string): Promise<void> {
  const vehicle = await repo.findVehicle(vehicleId, orgId);

  if (!vehicle) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "Vehicle not found.");
  }
}

export async function listVehiclePhotos(vehicleId: string, orgId: string): Promise<PhotoResponse[]> {
  await ensureVehicleInOrg(vehicleId, orgId);
  const photos = await repo.listPhotos(vehicleId, orgId);
  return photos.map(toPhotoResponse);
}

export async function getVehiclePhoto(photoId: string, vehicleId: string, orgId: string): Promise<PhotoResponse> {
  await ensureVehicleInOrg(vehicleId, orgId);
  const photo = await repo.findPhoto(photoId, vehicleId, orgId);

  if (!photo || photo.deleted_at) {
    throw new AppError(404, "PHOTO_NOT_FOUND", "Photo not found.");
  }

  return toPhotoResponse(photo);
}

export async function serveVehiclePhoto(
  photoId: string,
  vehicleId: string,
  orgId: string,
): Promise<{ buffer: Buffer; mimeType: string; size: number }> {
  await ensureVehicleInOrg(vehicleId, orgId);
  const photo = await repo.findPhoto(photoId, vehicleId, orgId);

  if (!photo || photo.deleted_at) {
    throw new AppError(404, "PHOTO_NOT_FOUND", "Photo not found.");
  }

  const buffer = await storageProvider.retrieve(photo.storage_key);

  return {
    buffer,
    mimeType: photo.mime_type,
    size: buffer.length,
  };
}

export async function uploadVehiclePhoto(
  vehicleId: string,
  orgId: string,
  file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
  input: CreatePhotoInput,
): Promise<PhotoResponse> {
  await ensureVehicleInOrg(vehicleId, orgId);

  if (!isPhotoMimeType(file.mimetype)) {
    throw new AppError(422, "UNSUPPORTED_MIME_TYPE", "Photo type must be JPEG, PNG, or WebP.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(422, "FILE_TOO_LARGE", "Photo exceeds the 10 MB size limit.");
  }

  const storageKey = generateStorageKey(orgId, "vehicle", file.mimetype);
  await storageProvider.store(storageKey, file.buffer, file.mimetype);

  const record = await repo.createPhoto({
    organization_id: orgId,
    vehicle_id: vehicleId,
    sort_order: input.sortOrder,
    caption: input.caption ?? null,
    original_filename: sanitizeFilename(file.originalname),
    mime_type: file.mimetype,
    file_size: file.size,
    storage_key: storageKey,
  });

  return toPhotoResponse(record);
}

export async function deleteVehiclePhoto(photoId: string, vehicleId: string, orgId: string): Promise<void> {
  await ensureVehicleInOrg(vehicleId, orgId);
  const photo = await repo.findPhoto(photoId, vehicleId, orgId);

  if (!photo || photo.deleted_at) {
    throw new AppError(404, "PHOTO_NOT_FOUND", "Photo not found.");
  }

  await repo.softDeletePhoto(photoId);
}

export async function listVehicleDocuments(vehicleId: string, orgId: string): Promise<DocumentResponse[]> {
  await ensureVehicleInOrg(vehicleId, orgId);
  const documents = await repo.listDocuments(vehicleId, orgId);
  return documents.map(toDocumentResponse);
}

export async function getVehicleDocument(documentId: string, vehicleId: string, orgId: string): Promise<DocumentResponse> {
  await ensureVehicleInOrg(vehicleId, orgId);
  const document = await repo.findDocument(documentId, vehicleId, orgId);

  if (!document || document.deleted_at) {
    throw new AppError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
  }

  return toDocumentResponse(document);
}

export async function uploadVehicleDocument(
  vehicleId: string,
  orgId: string,
  file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
  input: CreateDocumentInput,
): Promise<DocumentResponse> {
  await ensureVehicleInOrg(vehicleId, orgId);

  if (!isDocumentMimeType(file.mimetype)) {
    throw new AppError(422, "UNSUPPORTED_MIME_TYPE", "Document type must be PDF, JPEG, or PNG.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(422, "FILE_TOO_LARGE", "Document exceeds the 10 MB size limit.");
  }

  const storageKey = generateStorageKey(orgId, "vehicle", file.mimetype);
  await storageProvider.store(storageKey, file.buffer, file.mimetype);

  const record = await repo.createDocument({
    organization_id: orgId,
    vehicle_id: vehicleId,
    category: input.category,
    original_filename: sanitizeFilename(file.originalname),
    mime_type: file.mimetype,
    file_size: file.size,
    storage_key: storageKey,
  });

  return toDocumentResponse(record);
}

export async function deleteVehicleDocument(documentId: string, vehicleId: string, orgId: string): Promise<void> {
  await ensureVehicleInOrg(vehicleId, orgId);
  const document = await repo.findDocument(documentId, vehicleId, orgId);

  if (!document || document.deleted_at) {
    throw new AppError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
  }

  await repo.softDeleteDocument(documentId);
}

async function ensureCustomerInOrg(customerId: string, orgId: string): Promise<void> {
  const customer = await repo.findCustomer(customerId, orgId);

  if (!customer) {
    throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found.");
  }
}

export async function listCustomerDocuments(customerId: string, orgId: string): Promise<DocumentResponse[]> {
  await ensureCustomerInOrg(customerId, orgId);
  const documents = await repo.listCustomerDocuments(customerId, orgId);
  return documents.map(toDocumentResponse);
}

export async function getCustomerDocument(documentId: string, customerId: string, orgId: string): Promise<DocumentResponse> {
  await ensureCustomerInOrg(customerId, orgId);
  const document = await repo.findCustomerDocument(documentId, customerId, orgId);

  if (!document || document.deleted_at) {
    throw new AppError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
  }

  return toDocumentResponse(document);
}

export async function uploadCustomerDocument(
  customerId: string,
  orgId: string,
  file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
  input: CreateDocumentInput,
): Promise<DocumentResponse> {
  await ensureCustomerInOrg(customerId, orgId);

  if (!isDocumentMimeType(file.mimetype)) {
    throw new AppError(422, "UNSUPPORTED_MIME_TYPE", "Document type must be PDF, JPEG, or PNG.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(422, "FILE_TOO_LARGE", "Document exceeds the 10 MB size limit.");
  }

  const storageKey = generateStorageKey(orgId, "customer", file.mimetype);
  await storageProvider.store(storageKey, file.buffer, file.mimetype);

  const record = await repo.createCustomerDocument({
    organization_id: orgId,
    customer_id: customerId,
    category: input.category,
    original_filename: sanitizeFilename(file.originalname),
    mime_type: file.mimetype,
    file_size: file.size,
    storage_key: storageKey,
  });

  return toDocumentResponse(record);
}

export async function deleteCustomerDocument(documentId: string, customerId: string, orgId: string): Promise<void> {
  await ensureCustomerInOrg(customerId, orgId);
  const document = await repo.findCustomerDocument(documentId, customerId, orgId);

  if (!document || document.deleted_at) {
    throw new AppError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
  }

  await repo.softDeleteDocument(documentId);
}

export interface DownloadResult {
  buffer: Buffer;
  mimeType: string;
  filename: string;
  size: number;
}

export async function downloadVehicleDocument(
  documentId: string,
  vehicleId: string,
  orgId: string,
): Promise<DownloadResult> {
  await ensureVehicleInOrg(vehicleId, orgId);
  const document = await repo.findDocument(documentId, vehicleId, orgId);

  if (!document || document.deleted_at) {
    throw new AppError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
  }

  const buffer = await storageProvider.retrieve(document.storage_key);

  return {
    buffer,
    mimeType: document.mime_type,
    filename: document.original_filename,
    size: buffer.length,
  };
}

export async function downloadCustomerDocument(
  documentId: string,
  customerId: string,
  orgId: string,
): Promise<DownloadResult> {
  await ensureCustomerInOrg(customerId, orgId);
  const document = await repo.findCustomerDocument(documentId, customerId, orgId);

  if (!document || document.deleted_at) {
    throw new AppError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
  }

  const buffer = await storageProvider.retrieve(document.storage_key);

  return {
    buffer,
    mimeType: document.mime_type,
    filename: document.original_filename,
    size: buffer.length,
  };
}

export const mediaService = {
  listVehiclePhotos,
  getVehiclePhoto,
  serveVehiclePhoto,
  uploadVehiclePhoto,
  deleteVehiclePhoto,
  listVehicleDocuments,
  getVehicleDocument,
  uploadVehicleDocument,
  deleteVehicleDocument,
  downloadVehicleDocument,
  listCustomerDocuments,
  getCustomerDocument,
  uploadCustomerDocument,
  deleteCustomerDocument,
  downloadCustomerDocument,
};
