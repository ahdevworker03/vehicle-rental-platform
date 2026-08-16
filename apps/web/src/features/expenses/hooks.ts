import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListExpenses,
  useGetExpense,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  getListExpensesQueryKey,
  getGetExpenseQueryKey,
} from "@workspace/api-client-react";

export function useExpenses(params?: { vehicleId?: string }) {
  const query = useListExpenses(params);
  return query;
}

export function useExpense(id: string) {
  const query = useGetExpense(id);
  return query;
}

export function useExpenseMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
  };

  const create = useCreateExpense({
    mutation: {
      onSuccess: () => invalidateAll(),
    },
  });

  const update = useUpdateExpense({
    mutation: {
      onSuccess: (_data, variables) => {
        invalidateAll();
        void queryClient.invalidateQueries({
          queryKey: getGetExpenseQueryKey(variables.id),
        });
      },
    },
  });

  const remove = useDeleteExpense({
    mutation: {
      onSuccess: (_data, variables) => {
        invalidateAll();
        void queryClient.invalidateQueries({
          queryKey: getGetExpenseQueryKey(variables.id),
        });
      },
    },
  });

  return { create, update, remove };
}

export function useExpensesList(vehicleId?: string) {
  const query = useListExpenses(vehicleId ? { vehicleId } : undefined);

  const expenses = useMemo(() => query.data?.data ?? [], [query.data]);

  return { ...query, expenses };
}
