import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetVehicleQueryKey,
  getListVehiclesQueryKey,
  useCreateVehicle,
  useDeleteVehicle,
  useGetVehicle,
  useListVehicles,
  useUpdateVehicle,
} from "@workspace/api-client-react";

export function useVehiclesList(params?: { search?: string }) {
  const query = useListVehicles(params);
  const vehicles = useMemo(() => query.data?.data ?? [], [query.data]);

  return { ...query, vehicles };
}

export function useVehicleRecord(id: string) {
  return useGetVehicle(id);
}

export function useVehicleMutations() {
  const queryClient = useQueryClient();
  const invalidateList = () => void queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
  const invalidateRecord = (id: string) => void queryClient.invalidateQueries({ queryKey: getGetVehicleQueryKey(id) });

  const create = useCreateVehicle({ mutation: { onSuccess: invalidateList } });
  const update = useUpdateVehicle({ mutation: { onSuccess: (_data, variables) => { invalidateList(); invalidateRecord(variables.id); } } });
  const remove = useDeleteVehicle({ mutation: { onSuccess: (_data, variables) => { invalidateList(); invalidateRecord(variables.id); } } });

  return { create, update, remove };
}
