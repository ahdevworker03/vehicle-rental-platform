import { Car, Calendar, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateShort } from "@/lib/format";
import { RENTAL_STATUS_LABELS } from "@/lib/rental-labels";
import type { RentalResponse } from "@workspace/api-client-react";

interface RentalCardProps {
  rental: RentalResponse;
  customerName: string;
  vehicleName: string;
  vehiclePlate: string;
  onClick?: () => void;
  className?: string;
}

const statusBadgeClass: Record<RentalResponse["status"], string> = {
  RESERVED: "bg-[hsl(var(--status-maintenance-bg))] text-[hsl(var(--status-maintenance))]",
  ACTIVE: "bg-[hsl(var(--status-rented-bg))] text-[hsl(var(--status-rented))]",
  RETURNED: "bg-[hsl(var(--status-available-bg))] text-[hsl(var(--status-available))]",
  CANCELLED: "bg-[hsl(var(--status-danger-bg))] text-[hsl(var(--status-danger))]",
};

export function RentalCard({
  rental,
  customerName,
  vehicleName,
  vehiclePlate,
  onClick,
  className,
}: RentalCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-2xl border border-card-border shadow-sm p-4",
        onClick && "cursor-pointer active:scale-[0.99] transition-transform",
        className
      )}
    >
      {/* Row 1: Status badge (right) + Customer name (left) */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-0.5 rounded-full",
            statusBadgeClass[rental.status]
          )}
        >
          {RENTAL_STATUS_LABELS[rental.status]}
        </span>
        <span className="text-base font-bold text-foreground">{customerName}</span>
      </div>

      {/* Row 2: Vehicle */}
      <div className="flex items-center justify-end gap-1.5 mb-2">
        <span className="text-xs text-muted-foreground">{vehiclePlate}</span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-sm font-medium text-foreground">{vehicleName}</span>
        <Car className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
      </div>

      {/* Row 3: Date range — RTL order: pickup right (first), expected return left (last) */}
      <div className="flex items-center justify-end gap-1.5 mb-3">
        <span className="text-xs text-muted-foreground">{formatDateShort(rental.expectedReturnDate)}</span>
        <span className="text-xs text-muted-foreground">—</span>
        <span className="text-xs text-muted-foreground">{formatDateShort(rental.pickupDate)}</span>
        <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
      </div>

      {/* Row 4: Financial + chevron */}
      <div className="flex items-center justify-between border-t border-border pt-2.5 gap-2">
        <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2} />
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <span className="text-sm font-bold text-[hsl(var(--status-danger))]">
            {formatCurrency(rental.depositAmount)} تأمين
          </span>
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(rental.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
