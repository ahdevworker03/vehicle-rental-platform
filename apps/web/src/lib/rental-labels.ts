import type { RentalResponseStatus } from "@workspace/api-client-react";

export const RENTAL_STATUS_LABELS: Record<RentalResponseStatus, string> = {
  RESERVED: "محجوز",
  ACTIVE: "نشط",
  RETURNED: "مُعاد",
  CANCELLED: "ملغي",
};

export const RENTAL_STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "الكل", value: "all" },
  { label: "محجوز", value: "RESERVED" },
  { label: "نشط", value: "ACTIVE" },
  { label: "مُعاد", value: "RETURNED" },
  { label: "ملغي", value: "CANCELLED" },
];
