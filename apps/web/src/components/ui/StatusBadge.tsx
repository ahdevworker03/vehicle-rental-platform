import { cn } from "@/lib/utils";
import { VEHICLE_STATUS_LABELS } from "@/lib/vehicle-labels";

export type StatusTone = "positive" | "info" | "warning" | "danger" | "neutral";

export type StatusType =
  | "available"
  | "rented"
  | "maintenance"
  | "completed"
  | "upcoming"
  | "overdue"
  | "AVAILABLE"
  | "RESERVED"
  | "RENTED"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE"
  | "ARCHIVED"
  | "ACTIVE"
  | "RETURNED"
  | "CANCELLED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PENDING"
  | "PAID"
  | "PARTIAL"
  | "OUTSTANDING"
  | "OVERDUE";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const toneClass: Record<StatusTone, string> = {
  positive: "border-status-positive/25 bg-status-positive-bg text-status-positive",
  info: "border-status-info/25 bg-status-info-bg text-status-info",
  warning: "border-status-warning/25 bg-status-warning-bg text-status-warning",
  danger: "border-status-danger/25 bg-status-danger-bg text-status-danger",
  neutral: "border-status-neutral/20 bg-status-neutral-bg text-status-neutral",
};

const statusMap: Record<StatusType, { label: string; tone: StatusTone }> = {
  available: { label: "متاحة", tone: "positive" },
  rented: { label: "مؤجرة", tone: "info" },
  maintenance: { label: "في الصيانة", tone: "warning" },
  completed: { label: "مكتملة", tone: "positive" },
  upcoming: { label: "قادمة", tone: "warning" },
  overdue: { label: "متأخرة", tone: "danger" },
  AVAILABLE: { label: VEHICLE_STATUS_LABELS.AVAILABLE, tone: "positive" },
  RESERVED: { label: "محجوز", tone: "info" },
  RENTED: { label: VEHICLE_STATUS_LABELS.RENTED, tone: "info" },
  MAINTENANCE: { label: VEHICLE_STATUS_LABELS.MAINTENANCE, tone: "warning" },
  OUT_OF_SERVICE: { label: VEHICLE_STATUS_LABELS.OUT_OF_SERVICE, tone: "danger" },
  ARCHIVED: { label: VEHICLE_STATUS_LABELS.ARCHIVED, tone: "neutral" },
  ACTIVE: { label: "نشط", tone: "info" },
  RETURNED: { label: "مُعاد", tone: "positive" },
  CANCELLED: { label: "ملغي", tone: "danger" },
  SCHEDULED: { label: "مجدولة", tone: "warning" },
  IN_PROGRESS: { label: "قيد التنفيذ", tone: "info" },
  COMPLETED: { label: "مكتملة", tone: "positive" },
  PENDING: { label: "قيد الانتظار", tone: "warning" },
  PAID: { label: "مدفوع بالكامل", tone: "positive" },
  PARTIAL: { label: "دفعة جزئية", tone: "warning" },
  OUTSTANDING: { label: "رصيد مستحق", tone: "danger" },
  OVERDUE: { label: "متأخر", tone: "danger" },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusMap[status];

  return (
    <span
      data-status={status}
      className={cn(
        "ui-badge-text inline-flex min-h-6 shrink-0 items-center justify-center rounded-md border px-2 py-0.5 whitespace-nowrap",
        toneClass[config.tone],
        className
      )}
    >
      {label ?? config.label}
    </span>
  );
}
