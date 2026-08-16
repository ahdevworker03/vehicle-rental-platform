import { useState } from "react";
import { useLocation } from "wouter";
import { Wrench, History } from "lucide-react";

import { MaintenanceCard, type MaintenanceCardStatus } from "@/components/ui/MaintenanceCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api-error";
import { useMaintenanceForVehicleList } from "@/features/maintenance/hooks";
import { getDisplayStatus } from "@/features/maintenance/selectors";

interface MaintenanceHistorySectionProps {
  vehicleId: string;
  title?: string;
  emptyMessage?: string;
}

export function MaintenanceHistorySection({
  vehicleId,
  title = "سجل الصيانة",
  emptyMessage = "لا توجد صيانة لهذه السيارة",
}: MaintenanceHistorySectionProps) {
  const [, setLocation] = useLocation();
  const { records, isLoading, isError, error } = useMaintenanceForVehicleList(vehicleId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          {error ? getApiErrorMessage(error).title : "حدث خطأ في تحميل سجل الصيانة"}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={emptyMessage}
          description="ستظهر سجلات الصيانة هنا عند إنشائها"
          className="py-8"
        />
      ) : (
        <div className="space-y-2">
          {records.map((record) => {
            const displayStatus: MaintenanceCardStatus = getDisplayStatus(record);
            return (
              <MaintenanceCard
                key={record.id}
                record={record}
                displayStatus={displayStatus}
                vehicleName=""
                vehiclePlate=""
                isExpanded={expandedId === record.id}
                onToggle={() => setExpandedId((prev) => (prev === record.id ? null : record.id))}
                onOpen={() => setLocation(`/maintenance/${record.id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
