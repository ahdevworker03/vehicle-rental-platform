import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatInitials } from "@/lib/format";
import type { CustomerResponse } from "@workspace/api-client-react";

interface CustomerCardProps {
  customer: CustomerResponse;
  onClick?: () => void;
  className?: string;
}

export function CustomerCard({ customer, onClick, className }: CustomerCardProps) {
  const fullName = `${customer.firstName} ${customer.lastName}`.trim();

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden",
        onClick && "cursor-pointer active:scale-[0.99] transition-transform",
        className,
      )}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Avatar — RIGHT in RTL (first child) */}
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-base">
          {formatInitials(fullName)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name */}
          <div className="text-sm font-bold text-foreground mb-0.5 truncate">
            {fullName}
          </div>

          {/* Row 2: Phone · Address */}
          <div className="text-xs text-muted-foreground">
            {customer.phone}
            {customer.address && (
              <span className="before:content-['·'] before:mx-1.5">
                {customer.address}
              </span>
            )}
          </div>
        </div>

        {/* Chevron — LEFT in RTL (last child) */}
        <ChevronLeft
          className="w-4 h-4 text-muted-foreground flex-shrink-0"
          strokeWidth={2}
        />
      </div>
    </div>
  );
}
