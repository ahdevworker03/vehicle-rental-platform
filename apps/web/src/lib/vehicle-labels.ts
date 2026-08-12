import type { VehicleResponseStatus, VehicleResponseTransmission, VehicleResponseFuelType } from "@workspace/api-client-react";

export const VEHICLE_STATUS_LABELS: Record<VehicleResponseStatus, string> = {
  AVAILABLE: "متاحة",
  RESERVED: "محجوزة",
  RENTED: "مؤجرة",
  MAINTENANCE: "صيانة",
  OUT_OF_SERVICE: "خارج الخدمة",
  ARCHIVED: "مؤرشفة",
};

export const VEHICLE_STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "الكل", value: "all" },
  { label: "متاحة", value: "AVAILABLE" },
  { label: "محجوزة", value: "RESERVED" },
  { label: "مؤجرة", value: "RENTED" },
  { label: "صيانة", value: "MAINTENANCE" },
  { label: "خارج الخدمة", value: "OUT_OF_SERVICE" },
  { label: "مؤرشفة", value: "ARCHIVED" },
];

export const TRANSMISSION_LABELS: Record<VehicleResponseTransmission, string> = {
  MANUAL: "يدوي",
  AUTOMATIC: "أوتوماتيك",
};

export const FUEL_TYPE_LABELS: Record<VehicleResponseFuelType, string> = {
  PETROL: "بنزين",
  DIESEL: "ديزل",
  ELECTRIC: "كهرباء",
  HYBRID: "هايبرد",
};
