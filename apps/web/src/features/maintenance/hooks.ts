import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListMaintenance,
  useGetMaintenance,
  useListVehicleMaintenance,
  useCreateMaintenance,
  useCompleteMaintenance,
  useDeleteMaintenance,
  getListMaintenanceQueryKey,
  getGetMaintenanceQueryKey,
} from "@workspace/api-client-react";

export function useMaintenance() {
  const query = useListMaintenance();
  return query;
}

export function useMaintenanceRecord(id: string) {
  const query = useGetMaintenance(id);
  return query;
}

export function useMaintenanceForVehicle(vehicleId: string) {
  const query = useListVehicleMaintenance(vehicleId);
  return query;
}

export function useMaintenanceMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: getListMaintenanceQueryKey() });
  };

  const create = useCreateMaintenance({
    mutation: {
      onSuccess: () => invalidateAll(),
    },
  });

  const complete = useCompleteMaintenance({
    mutation: {
      onSuccess: (_data, variables) => {
        invalidateAll();
        void queryClient.invalidateQueries({
          queryKey: getGetMaintenanceQueryKey(variables.id),
        });
      },
    },
  });

  const remove = useDeleteMaintenance({
    mutation: {
      onSuccess: (_data, variables) => {
        invalidateAll();
        void queryClient.invalidateQueries({
          queryKey: getGetMaintenanceQueryKey(variables.id),
        });
      },
    },
  });

  return { create, complete, remove };
}

export function useMaintenanceForVehicleList(vehicleId: string) {
  const query = useListVehicleMaintenance(vehicleId);

  const records = useMemo(() => query.data?.data ?? [], [query.data]);

  return { ...query, records };
}
