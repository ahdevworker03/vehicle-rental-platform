import type {
  ContractDocumentResponse,
  ContractResponse,
  DocumentCategory,
} from "./contract.types";

export function toContractDocumentResponse(
  record: {
    id: string;
    contract_id: string | null;
    category: DocumentCategory;
    expiry_date: Date | null;
    original_filename: string;
    mime_type: string;
    file_size: number;
    storage_key: string;
    created_at: Date;
    updated_at: Date;
  },
  rentalId: string,
): ContractDocumentResponse {
  return {
    id: record.id,
    contractId: record.contract_id ?? "",
    rentalId,
    category: record.category,
    expiryDate: record.expiry_date
      ? record.expiry_date.toISOString().slice(0, 10)
      : null,
    originalFilename: record.original_filename,
    mimeType: record.mime_type,
    fileSize: record.file_size,
    url: record.storage_key,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

export function toContractResponse(record: {
  id: string;
  rental_id: string;
  pickup_date: Date;
  expected_return_date: Date;
  daily_rate: { toString(): string };
  total_amount: { toString(): string };
  deposit_amount: { toString(): string };
  customer_first_name: string;
  customer_last_name: string;
  customer_national_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate_number: string;
  created_at: Date;
  updated_at: Date;
}): ContractResponse {
  return {
    id: record.id,
    rentalId: record.rental_id,
    pickupDate: record.pickup_date.toISOString(),
    expectedReturnDate: record.expected_return_date.toISOString(),
    dailyRate: Number(record.daily_rate.toString()),
    totalAmount: Number(record.total_amount.toString()),
    depositAmount: Number(record.deposit_amount.toString()),
    customerFirstName: record.customer_first_name,
    customerLastName: record.customer_last_name,
    customerNationalId: record.customer_national_id,
    vehicleMake: record.vehicle_make,
    vehicleModel: record.vehicle_model,
    vehiclePlateNumber: record.vehicle_plate_number,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}
