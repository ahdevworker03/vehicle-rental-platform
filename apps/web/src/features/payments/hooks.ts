import { useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
  useListRentalPayments,
  useListPayments,
  useListRentals,
  useCreatePayment,
  getListRentalPaymentsQueryKey,
  getListRentalPaymentsQueryOptions,
  getListPaymentsQueryKey,
} from "@workspace/api-client-react";
import {
  getTotalOutstanding,
  type RentalOutstandingBalance,
} from "./selectors";

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

/** All recorded payments in the current organization (API-backed). */
export function usePayments() {
  const query = useListPayments();
  const payments = useMemo(() => query.data?.data ?? [], [query.data]);
  return { ...query, payments };
}

/**
 * Aggregate outstanding balance across the organization.
 *
 * The org-wide Payment list does not expose an aggregate outstanding figure, so
 * this fetches the org's rentals and their authoritative per-rental
 * `outstandingBalance` values concurrently, then sums the API-returned balances.
 * No client-side totalAmount - payments math is performed.
 *
 * NOTE (limitation): this issues one extra query per active rental. The
 * aggregate is only reported when every rental balance query has resolved; while
 * any balance query is loading or has failed, `totalOutstanding` is `null` so a
 * potentially incomplete aggregate is never presented as correct.
 */
export function useOrgOutstandingBalances() {
  const rentalsQuery = useListRentals();
  const rentals = rentalsQuery.data?.data ?? [];

  const balanceQueries = useQueries({
    queries: rentals.map((rental) =>
      getListRentalPaymentsQueryOptions(rental.id),
    ),
  });

  const loading =
    rentalsQuery.isLoading || balanceQueries.some((q) => q.isLoading);
  const error = rentalsQuery.error ?? balanceQueries.find((q) => q.isError)?.error ?? null;
  const isError = Boolean(error);
  const isSuccess = !loading && !isError && balanceQueries.every((q) => q.isSuccess);

  const balances = useMemo<RentalOutstandingBalance[]>(() => {
    if (!isSuccess) return [];
    return rentals.map((rental, i) => ({
      rentalId: rental.id,
      customerId: rental.customerId,
      outstandingBalance: balanceQueries[i]?.data?.data.outstandingBalance ?? 0,
    }));
  }, [rentals, balanceQueries, isSuccess]);

  const totalOutstanding = useMemo(
    () => (isSuccess ? getTotalOutstanding(balances) : null),
    [balances, isSuccess],
  );

  return {
    balances,
    totalOutstanding,
    rentals,
    isLoading: loading,
    isError,
    error,
  };
}
