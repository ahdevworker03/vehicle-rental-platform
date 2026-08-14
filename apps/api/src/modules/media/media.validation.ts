import { z } from "zod";

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

export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
