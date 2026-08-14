import type { Decimal } from "@prisma/client/runtime/client";

export interface ContractRecord {
  id: string;
  organization_id: string;
  rental_id: string;
  pickup_date: Date;
  expected_return_date: Date;
  daily_rate: Decimal;
  total_amount: Decimal;
  deposit_amount: Decimal;
  customer_first_name: string;
  customer_last_name: string;
  customer_national_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate_number: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ContractResponse {
  id: string;
  rentalId: string;
  pickupDate: string;
  expectedReturnDate: string;
  dailyRate: number;
  totalAmount: number;
  depositAmount: number;
  customerFirstName: string;
  customerLastName: string;
  customerNationalId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  createdAt: string;
  updatedAt: string;
}

/** Rental + Customer + Vehicle data needed to populate a Contract snapshot. */
export interface ContractSourceData {
  rental: {
    id: string;
    organization_id: string;
    pickup_date: Date;
    expected_return_date: Date;
    daily_rate: { toString(): string };
    total_amount: { toString(): string };
    deposit_amount: { toString(): string };
  };
  customer: {
    first_name: string;
    last_name: string;
    national_id: string;
  };
  vehicle: {
    make: string;
    model: string;
    plate_number: string;
  };
}

export type DocumentCategory = "REGISTRATION" | "INSURANCE" | "OTHER";

export interface ContractDocumentRecord {
  id: string;
  organization_id: string;
  contract_id: string | null;
  category: DocumentCategory;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_key: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ContractDocumentResponse {
  id: string;
  contractId: string;
  rentalId: string;
  category: DocumentCategory;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  url: string;
  createdAt: string;
  updatedAt: string;
}
