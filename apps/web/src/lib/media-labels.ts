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

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("ar-LB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
