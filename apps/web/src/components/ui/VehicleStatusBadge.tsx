import { cn } from "@/lib/utils";
import type { VehicleResponseStatus } from "@workspace/api-client-react";
import { VEHICLE_STATUS_LABELS } from "@/lib/vehicle-labels";

interface VehicleStatusBadgeProps {
  status: VehicleResponseStatus;
  className?: string;
}

const statusMap: Record<VehicleResponseStatus, { bgClass: string; textClass: string }> = {
  AVAILABLE: { bgClass: "bg-[hsl(var(--status-available-bg))]", textClass: "text-[hsl(var(--status-available))]" },
  RENTED: { bgClass: "bg-[hsl(var(--status-rented-bg))]", textClass: "text-[hsl(var(--status-rented))]" },
  MAINTENANCE: { bgClass: "bg-[hsl(var(--status-maintenance-bg))]", textClass: "text-[hsl(var(--status-maintenance))]" },
  RESERVED: { bgClass: "bg-[hsl(var(--status-rented-bg))]", textClass: "text-[hsl(var(--status-rented))]" },
  OUT_OF_SERVICE: { bgClass: "bg-[hsl(var(--status-danger-bg))]", textClass: "text-[hsl(var(--status-danger))]" },
  ARCHIVED: { bgClass: "bg-[hsl(var(--status-maintenance-bg))]", textClass: "text-[hsl(var(--status-maintenance))]" },
};

export function VehicleStatusBadge({ status, className }: VehicleStatusBadgeProps) {
  const config = statusMap[status] ?? statusMap.AVAILABLE;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
        config.bgClass,
        config.textClass,
        className,
      )}
    >
      {VEHICLE_STATUS_LABELS[status]}
    </span>
  );
}
