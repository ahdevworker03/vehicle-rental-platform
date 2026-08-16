import { Wrench, Hammer, Settings2, SearchCheck, Fuel, Shield, FileText, SprayCan, MoreHorizontal } from "lucide-react";
import type { MaintenanceResponseType, ExpenseResponseCategory } from "@workspace/api-client-react";

export const MAINTENANCE_TYPES: Record<
  MaintenanceResponseType,
  { label: string; icon: React.ElementType }
> = {
  PREVENTIVE_SERVICE: { label: "صيانة وقائية", icon: Settings2 },
  INSPECTION:         { label: "فحص",          icon: SearchCheck },
  REPAIR:             { label: "تصليح",        icon: Hammer   },
  OTHER:              { label: "أخرى",         icon: Wrench   },
};

export const MAINTENANCE_TYPE_OPTIONS = (
  Object.keys(MAINTENANCE_TYPES) as MaintenanceResponseType[]
).map((value) => ({ value, ...MAINTENANCE_TYPES[value] }));

export const MAINTENANCE_STATUS_LABELS: Record<
  string,
  string
> = {
  SCHEDULED: "مجدولة",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتملة",
};

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  available: "متاحة",
  rented: "مؤجرة",
  maintenance: "صيانة",
};

export const EXPENSE_CATEGORY_LABELS: Record<
  ExpenseResponseCategory,
  { label: string; icon: React.ElementType }
> = {
  FUEL:         { label: "وقود",       icon: Fuel },
  INSURANCE:    { label: "تأمين",       icon: Shield },
  REGISTRATION: { label: "تسجيل",       icon: FileText },
  CLEANING:     { label: "تنظيف",       icon: SprayCan },
  OTHER:        { label: "أخرى",        icon: MoreHorizontal },
};

export const EXPENSE_CATEGORY_OPTIONS = (
  Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseResponseCategory[]
).map((value) => ({ value, ...EXPENSE_CATEGORY_LABELS[value] }));

export const EXPENSE_CATEGORY_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "الكل", value: "all" },
  { label: "وقود", value: "FUEL" },
  { label: "تأمين", value: "INSURANCE" },
  { label: "تسجيل", value: "REGISTRATION" },
  { label: "تنظيف", value: "CLEANING" },
  { label: "أخرى", value: "OTHER" },
];
