import { useMemo } from "react";
import { useListRentals } from "@workspace/api-client-react";
import { usePayments } from "@/features/payments/hooks";
import { useExpensesList } from "@/features/expenses/hooks";
import { useMaintenance } from "@/features/maintenance/hooks";
import { useTasks } from "@/features/tasks/hooks";

/**
 * Wires all the data hooks needed for the Reports page into a single hook.
 * Returns the loaded data arrays plus combined loading/error state.
 *
 * The Reports page uses this to compute period-scoped summaries via the pure
 * selectors in `./selectors.ts` — no API calls are made here; all data is
 * loaded once and filtered client-side by the selected period.
 */
export function useReportData() {
  const paymentsQuery = usePayments();
  const expensesQuery = useExpensesList();
  const maintenanceQuery = useMaintenance();
  const tasksQuery = useTasks();
  const rentalsQuery = useListRentals();

  const payments = paymentsQuery.payments;
  const expenses = expensesQuery.expenses;
  const maintenance = useMemo(
    () => maintenanceQuery.data?.data ?? [],
    [maintenanceQuery.data],
  );
  const tasks = useMemo(
    () => tasksQuery.data?.data ?? [],
    [tasksQuery.data],
  );
  const rentals = useMemo(
    () => rentalsQuery.data?.data ?? [],
    [rentalsQuery.data],
  );

  const isLoading =
    paymentsQuery.isLoading ||
    expensesQuery.isLoading ||
    maintenanceQuery.isLoading ||
    tasksQuery.isLoading ||
    rentalsQuery.isLoading;

  const isError =
    paymentsQuery.isError ||
    expensesQuery.isError ||
    maintenanceQuery.isError ||
    tasksQuery.isError ||
    rentalsQuery.isError;

  const error =
    paymentsQuery.error ??
    expensesQuery.error ??
    maintenanceQuery.error ??
    tasksQuery.error ??
    rentalsQuery.error ??
    null;

  return {
    payments,
    expenses,
    maintenance,
    rentals,
    tasks,
    isLoading,
    isError,
    error,
  };
}
