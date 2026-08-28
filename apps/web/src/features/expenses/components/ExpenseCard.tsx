import { Calendar, ChevronLeft, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateShort } from "@/lib/format";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/labels";
import type { ExpenseResponse } from "@workspace/api-client-react";

interface ExpenseCardProps {
  expense: ExpenseResponse;
  vehicleName: string;
  vehiclePlate: string;
  onClick?: () => void;
  className?: string;
}

export function ExpenseCard({
  expense,
  vehicleName,
  vehiclePlate,
  onClick,
  className,
}: ExpenseCardProps) {
  const categoryConfig = EXPENSE_CATEGORY_LABELS[expense.category];
  const CategoryIcon = categoryConfig.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-2xl border border-card-border shadow-sm p-4",
        onClick && "cursor-pointer active:scale-[0.99] transition-transform",
        className
      )}
    >
      {/* Row 1: Category badge (right) + Amount (left) */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[hsl(var(--status-maintenance-bg))] text-[hsl(var(--status-maintenance))] flex items-center gap-1">
          <CategoryIcon className="w-3 h-3" strokeWidth={2} />
          {categoryConfig.label}
        </span>
        <span className="text-base font-bold text-foreground tabular-nums">
          {formatCurrency(expense.amount)}
        </span>
      </div>

      {/* Row 2: Vehicle (optional) */}
      {expense.vehicleId && vehicleName && (
        <div className="flex items-center justify-end gap-1.5 mb-2">
          <span className="text-xs text-muted-foreground">{vehiclePlate}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-sm font-medium text-foreground">{vehicleName}</span>
          <Car className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
        </div>
      )}

      {/* Row 3: Date + chevron */}
      <div className="flex items-center justify-between border-t border-border pt-2.5">
        <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2} />
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
          {formatDateShort(expense.expenseDate)}
        </span>
      </div>
    </div>
  );
}
