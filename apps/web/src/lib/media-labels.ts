import type { DocumentResponseCategory } from "@workspace/api-client-react";

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentResponseCategory, string> = {
  REGISTRATION: "تسجيل",
  INSURANCE: "تأمين",
  OTHER: "أخرى",
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
}
