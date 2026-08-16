import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Car,
  Calendar,
  Banknote,
  StickyNote,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateAr } from "@/lib/format";
import { MAINTENANCE_TYPES, MAINTENANCE_STATUS_LABELS } from "@/lib/labels";
import type { MaintenanceResponse } from "@workspace/api-client-react";

// ── Status colours (derived display state) ───────────────────────────────────

const STATUS_STYLES = {
  overdue: {
    iconBg:   "bg-[hsl(var(--status-danger-bg))]",
    iconText: "text-[hsl(var(--status-danger))]",
    badge:    "bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger))]",
    days:     "text-[hsl(var(--status-danger))]",
    border:   "border-[hsl(var(--status-danger))]/20",
  },
  upcoming: {
    iconBg:   "bg-[hsl(var(--status-maintenance-bg))]",
    iconText: "text-[hsl(var(--status-maintenance))]",
    badge:    "bg-[hsl(var(--status-maintenance-bg))] text-[hsl(var(--status-maintenance))]",
    days:     "text-[hsl(var(--status-maintenance))]",
    border:   "border-card-border",
  },
  completed: {
    iconBg:   "bg-[hsl(var(--status-available-bg))]",
    iconText: "text-[hsl(var(--status-available))]",
    badge:    "bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))]",
    days:     "text-[hsl(var(--status-available))]",
    border:   "border-card-border",
  },
};

export type MaintenanceCardStatus = keyof typeof STATUS_STYLES;

// ── Props ─────────────────────────────────────────────────────────────────────

interface MaintenanceCardProps {
  record: MaintenanceResponse;
  displayStatus: MaintenanceCardStatus;
  vehicleName: string;
  vehiclePlate: string;
  isExpanded: boolean;
  onToggle: () => void;
  onMarkComplete?: () => void;
  onOpen?: () => void;
}

function daysLabelFor(status: MaintenanceCardStatus, maintenanceDate: string): string | null {
  if (status === "completed") return null;
  const days = Math.ceil(
    (new Date(maintenanceDate).getTime() - Date.now()) / 86_400_000,
  );
  if (days < 0) return `متأخر ${Math.abs(days)} يوم`;
  if (days === 0) return "اليوم";
  return `بعد ${days} يوم`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MaintenanceCard({
  record,
  displayStatus,
  vehicleName,
  vehiclePlate,
  isExpanded,
  onToggle,
  onMarkComplete,
  onOpen,
}: MaintenanceCardProps) {
  const typeConfig = MAINTENANCE_TYPES[record.type];
  const TypeIcon = typeConfig.icon;
  const styles = STATUS_STYLES[displayStatus];
  const daysLabel = daysLabelFor(displayStatus, record.maintenanceDate);

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border shadow-sm overflow-hidden transition-all",
        styles.border
      )}
    >
      {/* ── Collapsed row ─────────────────────────────────────────── */}
      <button
        onClick={onOpen ?? onToggle}
        aria-expanded={isExpanded}
        aria-controls={`maintenance-detail-${record.id}`}
        className="w-full flex items-center gap-3 p-4 text-right"
      >
        {/* Type icon — RIGHT in RTL */}
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
            styles.iconBg
          )}
        >
          <TypeIcon className={cn("w-5 h-5", styles.iconText)} strokeWidth={1.8} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            {/* Days / status label — LEFT */}
            {daysLabel && (
              <span className={cn("text-xs font-bold flex-shrink-0", styles.days)}>
                {daysLabel}
              </span>
            )}
            {record.status === "COMPLETED" && (
              <CheckCircle
                className="w-4 h-4 text-[hsl(var(--status-available))] flex-shrink-0"
                strokeWidth={2}
              />
            )}
            {/* Vehicle name — RIGHT */}
            <span className="text-sm font-bold text-foreground truncate">
              {vehicleName}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Date — LEFT */}
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatDateAr(record.maintenanceDate)}
            </span>
            {/* Type label — RIGHT */}
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                styles.badge
              )}
            >
              {typeConfig.label}
            </span>
          </div>
        </div>

        {/* Chevron toggle — LEFT */}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2} />
        )}
      </button>

      {/* ── Expanded detail ───────────────────────────────────────── */}
      {isExpanded && (
        <div
          id={`maintenance-detail-${record.id}`}
          role="region"
          className="border-t border-border px-4 pt-3 pb-4 space-y-3"
        >
          {/* Vehicle */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Car className="w-3.5 h-3.5" strokeWidth={1.5} />
              {vehiclePlate}
            </span>
            <span className="text-sm font-semibold text-foreground">{vehicleName}</span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full", styles.badge)}>
              {MAINTENANCE_STATUS_LABELS[record.status] ?? record.status}
            </span>
            <span className="text-sm text-muted-foreground">الحالة</span>
          </div>

          {/* Maintenance date */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
              {formatDateAr(record.maintenanceDate)}
            </span>
            <span className="text-sm text-muted-foreground">تاريخ الصيانة</span>
          </div>

          {/* Completion date */}
          {record.completedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[hsl(var(--status-available))]">
                {formatDateAr(record.completedAt)}
              </span>
              <span className="text-sm text-muted-foreground">تاريخ الإنجاز</span>
            </div>
          )}

          {/* Cost */}
          {record.cost !== null && record.cost !== undefined && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Banknote className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                {formatCurrency(record.cost)}
              </span>
              <span className="text-sm text-muted-foreground">التكلفة</span>
            </div>
          )}

          {/* Vendor */}
          {record.vendor && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{record.vendor}</span>
              <span className="text-sm text-muted-foreground">الورشة / المزوّد</span>
            </div>
          )}

          {/* Replaced parts */}
          {record.replacedParts && record.replacedParts.length > 0 && (
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-foreground text-left flex-1 space-y-0.5">
                {record.replacedParts.map((p) => (
                  <span key={`${p.name}-${p.quantity ?? 1}`} className="block">
                    {p.name}
                    {p.brand ? ` (${p.brand})` : ""}
                    {p.quantity ? ` ×${p.quantity}` : ""}
                  </span>
                ))}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                القطع المبدلة
              </span>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-foreground text-left flex-1">
                {record.notes}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                <StickyNote className="w-3.5 h-3.5" strokeWidth={1.5} />
                ملاحظات
              </span>
            </div>
          )}

          {/* Action — only for non-completed records */}
          {onMarkComplete && record.status !== "COMPLETED" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkComplete();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--status-available))] text-white rounded-xl py-3 text-sm font-bold active:scale-[0.98] transition-transform mt-1"
            >
              <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
              تم الإنجاز
            </button>
          )}
        </div>
      )}
    </div>
  );
}
