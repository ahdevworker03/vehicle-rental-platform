import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetCustomerQueryKey,
  getListCustomersQueryKey,
  useCreateCustomer,
  useDeleteCustomer,
  useGetCustomer,
  useListCustomers,
  useUpdateCustomer,
} from "@workspace/api-client-react";

export function useCustomersList(params?: { search?: string }) {
  const query = useListCustomers(params);
  const customers = useMemo(() => query.data?.data ?? [], [query.data]);

  return { ...query, customers };
}

export function useCustomerRecord(id: string) {
  return useGetCustomer(id);
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();
  const invalidateList = () => void queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
  const invalidateRecord = (id: string) => void queryClient.invalidateQueries({ queryKey: getGetCustomerQueryKey(id) });

  const create = useCreateCustomer({ mutation: { onSuccess: invalidateList } });
  const update = useUpdateCustomer({ mutation: { onSuccess: (_data, variables) => { invalidateList(); invalidateRecord(variables.id); } } });
  const remove = useDeleteCustomer({ mutation: { onSuccess: (_data, variables) => { invalidateList(); invalidateRecord(variables.id); } } });

  return { create, update, remove };
}
