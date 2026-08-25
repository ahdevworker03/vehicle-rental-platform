import type {
  DocumentCategory,
  DocumentResponse,
  PhotoResponse,
} from "./media.types";

export function toPhotoResponse(record: {
  id: string;
  vehicle_id: string;
  sort_order: number;
  caption: string | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
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

export function toDocumentResponse(record: {
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
