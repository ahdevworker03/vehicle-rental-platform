import { z } from "zod";
import { AppError } from "../../shared";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

export const PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export function isPhotoMimeType(mimeType: string): boolean {
  return (PHOTO_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isDocumentMimeType(mimeType: string): boolean {
  return (DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function extensionForMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

export const createPhotoSchema = z.object({
  caption: z.string().optional(),
  sort_order: z.string().optional(),
});

export const createDocumentSchema = z.object({
  category: z.enum(["REGISTRATION", "INSURANCE", "OTHER"], {
    errorMap: () => ({
      message: "Category must be REGISTRATION, INSURANCE, or OTHER",
    }),
  }),
});

const minimumDocumentExpiryDate = new Date("1900-01-01T00:00:00.000Z");
const maximumDocumentExpiryDate = new Date("2100-12-31T00:00:00.000Z");

export const documentMetadataSchema = z.object({
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date must be YYYY-MM-DD.")
    .nullable(),
});

export function parseDocumentExpiryDate(value: unknown): Date | null {
  if (value === undefined || value === "" || value === null) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(422, "VALIDATION_ERROR", "expiryDate: Expiry date must be YYYY-MM-DD.");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value ||
    date < minimumDocumentExpiryDate ||
    date > maximumDocumentExpiryDate
  ) {
    throw new AppError(422, "VALIDATION_ERROR", "expiryDate: Expiry date must be between 1900-01-01 and 2100-12-31.");
  }
  return date;
}

export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
