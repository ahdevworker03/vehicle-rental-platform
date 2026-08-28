import { Car, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VehicleResponse } from "@workspace/api-client-react";
import { VehicleStatusBadge } from "./VehicleStatusBadge";

interface VehicleCardProps {
  vehicle: VehicleResponse;
  onClick?: () => void;
  className?: string;
}

export function VehicleCard({ vehicle, onClick, className }: VehicleCardProps) {
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
        {/* Vehicle icon — RIGHT in RTL (first child in flex-row) */}
        <div className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
          <Car className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Status (right) + Name (left) */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <VehicleStatusBadge status={vehicle.status} />
            <span className="text-sm font-bold text-foreground truncate">
              {vehicle.make} {vehicle.model}
            </span>
          </div>

          {/* Row 2: Plate + Year */}
          <div className="text-xs text-muted-foreground mb-2 font-medium">
            {vehicle.plateNumber} · {vehicle.year}
          </div>

          {/* Row 3: Mileage */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground">
              {vehicle.currentMileage.toLocaleString("ar-LB")} كم
            </span>
          </div>
        </div>

        {/* Chevron — LEFT in RTL (last child) */}
        <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2} />
      </div>
    </div>
  );
}
