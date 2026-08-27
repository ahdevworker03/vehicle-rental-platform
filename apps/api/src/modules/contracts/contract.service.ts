import { randomUUID } from "node:crypto";
import { AppError } from "../../shared";
import {
  isUniqueConstraintError,
  retrySerializable,
  transaction,
} from "../../database";
import { storageProvider } from "../../config/storage";
import { retrieveStoredFile, storeWithMetadata } from "../../storage";
import * as repo from "./contract.repository";
import { renderContractHtml, renderContractPdf } from "./contract.pdf";
import {
  toContractDocumentResponse,
  toContractResponse,
} from "./contract.mapper";
import type {
  ContractResponse,
  ContractDocumentResponse,
} from "./contract.types";
import { parseDocumentExpiryDate } from "../media/media.validation";

const GENERATABLE_RENTAL_STATUSES = ["RESERVED", "ACTIVE"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

function extensionForMimeType(mimeType: string): string {
  switch (mimeType) {
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return "bin";
  }
}

function sanitizeFilename(filename: string): string {
  const withoutPath = filename.split(/[\\/]/).pop() ?? filename;
  return withoutPath.trim();
}

async function getContract(
  rentalId: string,
  orgId: string,
): Promise<ContractResponse> {
  const contract = await repo.findActiveByRental(rentalId, orgId);

  if (!contract) {
    throw new AppError(
      404,
      "CONTRACT_NOT_FOUND",
      "Contract not found for this rental.",
    );
  }

  return toContractResponse(contract);
}

async function generateContract(
  rentalId: string,
  orgId: string,
): Promise<ContractResponse> {
  async function run(): Promise<ContractResponse> {
    const contract = await transaction(
      async (tx) => {
        const data = await repo.findRentalWithRelationsWithinTx(
          rentalId,
          orgId,
          tx,
        );

        if (!data.rental) {
          throw new AppError(404, "RENTAL_NOT_FOUND", "Rental not found.");
        }

        if (!GENERATABLE_RENTAL_STATUSES.includes(data.rental.status)) {
          throw new AppError(
            409,
            "INVALID_RENTAL_STATE",
            "Contract can only be generated for a reserved or active rental.",
          );
        }

        if (!data.customer || !data.vehicle) {
          throw new AppError(
            409,
            "RENTAL_MISSING_RELATIONS",
            "Rental is missing customer or vehicle information.",
          );
        }

        const snapshot = {
          organization_id: data.rental.organization_id,
          rental_id: rentalId,
          pickup_date: data.rental.pickup_date,
          expected_return_date: data.rental.expected_return_date,
          daily_rate: Number(data.rental.daily_rate.toString()),
          total_amount: Number(data.rental.total_amount.toString()),
          deposit_amount: Number(data.rental.deposit_amount.toString()),
          customer_first_name: data.customer.first_name,
          customer_last_name: data.customer.last_name,
          customer_national_id: data.customer.national_id,
          vehicle_make: data.vehicle.make,
          vehicle_model: data.vehicle.model,
          vehicle_plate_number: data.vehicle.plate_number,
        };
        const existing = await repo.findByRentalWithinTx(rentalId, orgId, tx);

        if (!existing) {
          return repo.createWithinTx(snapshot, tx);
        }

        if (!existing.deleted_at) {
          throw new AppError(
            409,
            "CONTRACT_EXISTS",
            "This rental already has a contract.",
          );
        }

        if (await repo.hasDocumentsWithinTx(existing.id, orgId, tx)) {
          throw new AppError(
            409,
            "SIGNED_CONTRACT_EXISTS",
            "A contract with signed documents cannot be regenerated.",
          );
        }

        return repo.restoreAndReplaceWithinTx(existing.id, snapshot, tx);
      },
      { isolationLevel: "Serializable" },
    );

    return toContractResponse(contract);
  }

  try {
    return await retrySerializable(run);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        409,
        "CONTRACT_EXISTS",
        "This rental already has a contract.",
      );
    }
    throw error;
  }
}

async function deleteContract(rentalId: string, orgId: string): Promise<void> {
  const contract = await repo.findActiveByRental(rentalId, orgId);

  if (!contract) {
    throw new AppError(
      404,
      "CONTRACT_NOT_FOUND",
      "Contract not found for this rental.",
    );
  }

  await repo.softDelete(contract.id);
}

async function ensureActiveContract(rentalId: string, orgId: string) {
  const contract = await repo.findActiveByRental(rentalId, orgId);

  if (!contract) {
    throw new AppError(
      404,
      "CONTRACT_NOT_FOUND",
      "Contract not found for this rental.",
    );
  }

  return contract;
}

async function getPrintableContract(
  rentalId: string,
  orgId: string,
): Promise<string> {
  const contract = await ensureActiveContract(rentalId, orgId);
  return renderContractHtml(toContractResponse(contract));
}

async function exportContractPdf(
  rentalId: string,
  orgId: string,
): Promise<Buffer> {
  const contract = await ensureActiveContract(rentalId, orgId);
  return renderContractPdf(toContractResponse(contract));
}

async function listSignedDocuments(
  rentalId: string,
  orgId: string,
): Promise<ContractDocumentResponse[]> {
  const contract = await ensureActiveContract(rentalId, orgId);
  const documents = await repo.listDocuments(contract.id, orgId);
  return documents.map((d) => toContractDocumentResponse(d, rentalId));
}

async function uploadSignedDocument(
  rentalId: string,
  orgId: string,
  file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  },
): Promise<ContractDocumentResponse> {
  const contract = await ensureActiveContract(rentalId, orgId);

  if (!(DOCUMENT_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
    throw new AppError(
      422,
      "UNSUPPORTED_MIME_TYPE",
      "Signed contract must be a PDF, JPEG, or PNG file.",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(
      422,
      "FILE_TOO_LARGE",
      "Signed contract exceeds the 10 MB size limit.",
    );
  }

  const extension = extensionForMimeType(file.mimetype);
  const storageKey = `${orgId}/contract/${randomUUID()}.${extension}`;
  const record = await storeWithMetadata(
    storageProvider,
    storageKey,
    file.buffer,
    file.mimetype,
    () =>
      repo.createDocument({
        organization_id: orgId,
        contract_id: contract.id,
        category: "OTHER",
        original_filename: sanitizeFilename(file.originalname),
        mime_type: file.mimetype,
        file_size: file.size,
        storage_key: storageKey,
      }),
  );

  return toContractDocumentResponse(record, rentalId);
}

async function getSignedDocument(
  rentalId: string,
  orgId: string,
  documentId: string,
): Promise<ContractDocumentResponse> {
  const contract = await ensureActiveContract(rentalId, orgId);
  const document = await repo.findDocument(documentId, contract.id, orgId);

  if (!document || document.deleted_at) {
    throw new AppError(
      404,
      "DOCUMENT_NOT_FOUND",
      "Signed contract document not found.",
    );
  }

  return toContractDocumentResponse(document, rentalId);
}

async function updateSignedDocumentExpiry(
  rentalId: string,
  orgId: string,
  documentId: string,
  expiryDate: unknown,
): Promise<ContractDocumentResponse> {
  const contract = await ensureActiveContract(rentalId, orgId);
  const document = await repo.findDocument(documentId, contract.id, orgId);
  if (!document || document.deleted_at) {
    throw new AppError(404, "DOCUMENT_NOT_FOUND", "Signed contract document not found.");
  }
  const updated = await repo.updateDocumentExpiry(
    documentId,
    contract.id,
    orgId,
    parseDocumentExpiryDate(expiryDate),
  );
  return toContractDocumentResponse(updated, rentalId);
}

async function downloadSignedDocument(
  rentalId: string,
  orgId: string,
  documentId: string,
): Promise<{
  buffer: Buffer;
  mimeType: string;
  filename: string;
  size: number;
}> {
  const contract = await ensureActiveContract(rentalId, orgId);
  const document = await repo.findDocument(documentId, contract.id, orgId);

  if (!document || document.deleted_at) {
    throw new AppError(
      404,
      "DOCUMENT_NOT_FOUND",
      "Signed contract document not found.",
    );
  }

  const buffer = await retrieveStoredFile(
    storageProvider,
    document.storage_key,
  );

  return {
    buffer,
    mimeType: document.mime_type,
    filename: document.original_filename,
    size: buffer.length,
  };
}

async function deleteSignedDocument(
  rentalId: string,
  orgId: string,
  documentId: string,
): Promise<void> {
  const contract = await ensureActiveContract(rentalId, orgId);
  const document = await repo.findDocument(documentId, contract.id, orgId);

  if (!document || document.deleted_at) {
    throw new AppError(
      404,
      "DOCUMENT_NOT_FOUND",
      "Signed contract document not found.",
    );
  }

  await repo.softDeleteDocument(document.id);
}

export {
  getContract,
  generateContract,
  deleteContract,
  getPrintableContract,
  exportContractPdf,
  listSignedDocuments,
  uploadSignedDocument,
  getSignedDocument,
  updateSignedDocumentExpiry,
  downloadSignedDocument,
  deleteSignedDocument,
};
