import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AnalyticsPage from "@/pages/AnalyticsPage";

vi.mock("@/features/vehicles/hooks", () => ({
  useVehicles: vi.fn(() => []),
}));

vi.mock("@/features/rentals/hooks", () => ({
  useRentals: vi.fn(() => []),
}));

vi.mock("@/features/customers/hooks", () => ({
  useCustomers: vi.fn(() => []),
  useCustomerById: vi.fn(() => () => undefined),
}));

vi.mock("@/features/maintenance/hooks", () => ({
  useMaintenance: vi.fn(() => ({ data: { data: [] }, isLoading: false, isError: false, error: null })),
}));

vi.mock("@/features/expenses/hooks", () => ({
  useExpenses: vi.fn(() => ({ data: { data: [] }, isLoading: false, isError: false, error: null })),
}));

vi.mock("@/features/payments/hooks", () => ({
  usePayments: vi.fn(() => ({ data: { data: [] }, payments: [], isLoading: false, isError: false, error: null })),
  useOrgOutstandingBalances: vi.fn(() => ({ balances: [], rentals: [], isLoading: false, isError: false, error: null })),
}));

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@workspace/api-client-react")>();
  return {
    ...actual,
    useListVehicles: vi.fn(() => ({ data: { data: [] }, isLoading: false, isError: false, error: null })),
    useListCustomers: vi.fn(() => ({ data: { data: [] }, isLoading: false, isError: false, error: null })),
  };
});

describe("AnalyticsPage insights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preserves the existing revenue section and renders trend and fleet insight sections", () => {
    render(<AnalyticsPage />);

    expect(screen.getAllByText("الإيرادات").length).toBeGreaterThan(0);
    expect(screen.getByText("اتجاه أداء الأعمال 2025")).toBeInTheDocument();
    expect(screen.getByText("رؤى السيارات")).toBeInTheDocument();
    expect(screen.getByText("لا توجد بيانات أداء لهذه السنة")).toBeInTheDocument();
    expect(screen.getByText("لا توجد بيانات كافية لرؤى السيارات")).toBeInTheDocument();
  });

  it("updates the trend period when the selected year changes", () => {
    render(<AnalyticsPage />);

    fireEvent.change(screen.getByRole("combobox", { name: "سنة التحليل" }), {
      target: { value: "2024" },
    });

    expect(screen.getByText("اتجاه أداء الأعمال 2024")).toBeInTheDocument();
  });

  it("shows loading state instead of empty insight values", async () => {
    const { useMaintenance } = await import("@/features/maintenance/hooks");
    vi.mocked(useMaintenance).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useMaintenance>);

    render(<AnalyticsPage />);

    expect(screen.getAllByRole("status").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("لا توجد بيانات أداء لهذه السنة")).not.toBeInTheDocument();
  });
});
