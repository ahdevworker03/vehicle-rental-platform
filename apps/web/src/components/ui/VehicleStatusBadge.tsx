import type { VehicleResponseStatus } from "@workspace/api-client-react";
import { StatusBadge } from "./StatusBadge";

interface VehicleStatusBadgeProps {
  status: VehicleResponseStatus;
  className?: string;
}

export function VehicleStatusBadge({ status, className }: VehicleStatusBadgeProps) {
  return <StatusBadge status={status} className={className} />;
}
