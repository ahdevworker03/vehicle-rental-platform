export type DocumentCategory = "REGISTRATION" | "INSURANCE" | "OTHER";

export interface PhotoRecord {
  id: string;
  organization_id: string;
  vehicle_id: string;
  sort_order: number;
  caption: string | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_key: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface DocumentRecord {
  id: string;
  organization_id: string;
  vehicle_id: string | null;
  customer_id: string | null;
  category: DocumentCategory;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_key: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface PhotoResponse {
  id: string;
  vehicleId: string;
  sortOrder: number;
  caption: string | null;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentResponse {
  id: string;
  vehicleId: string | null;
  customerId: string | null;
  category: DocumentCategory;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePhotoInput {
  caption?: string;
  sortOrder: number;
}

export interface CreateDocumentInput {
  category: DocumentCategory;
}
