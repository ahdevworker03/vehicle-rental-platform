import { Wrench, Hammer, Settings2, SearchCheck } from "lucide-react";
import type { MaintenanceResponseType } from "@workspace/api-client-react";

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
