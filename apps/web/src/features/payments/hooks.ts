import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListRentalPayments,
  useCreatePayment,
  getListRentalPaymentsQueryKey,
  getListPaymentsQueryKey,
} from "@workspace/api-client-react";

export function useRentalPayments(rentalId: string) {
  const query = useListRentalPayments(rentalId);

  const data = useMemo(
    () => ({
      payments: query.data?.data.payments ?? [],
      outstandingBalance: query.data?.data.outstandingBalance ?? 0,
    }),
    [query.data],
  );

  return { ...query, data };
}

export function usePaymentMutations(rentalId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: getListRentalPaymentsQueryKey(rentalId),
    });
    void queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
  };

  const create = useCreatePayment({
    mutation: {
      onSuccess: () => invalidate(),
    },
  });

  return { create };
}
