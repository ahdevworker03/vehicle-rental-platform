import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AnalyticsPage from "./AnalyticsPage";

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
  useMaintenance: vi.fn(() => ({
    data: { data: [] },
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

vi.mock("@/features/expenses/hooks", () => ({
  useExpenses: vi.fn(() => ({
    data: { data: [] },
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

vi.mock("@/features/payments/hooks", () => ({
  usePayments: vi.fn(() => ({
    data: { data: [] },
    payments: [],
    isLoading: false,
    isError: false,
    error: null,
  })),
  useOrgOutstandingBalances: vi.fn(() => ({
    balances: [],
    rentals: [],
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@workspace/api-client-react")>();
  return {
    ...actual,
    useListVehicles: vi.fn(() => ({
      data: { data: [] },
      isLoading: false,
      isError: false,
      error: null,
    })),
    useListCustomers: vi.fn(() => ({
      data: { data: [] },
      isLoading: false,
      isError: false,
      error: null,
    })),
  };
});

function openSelect(label: string) {
  const trigger = screen.getByRole("combobox", { name: label });
  Object.assign(trigger, {
    hasPointerCapture: () => false,
    setPointerCapture: () => undefined,
    releasePointerCapture: () => undefined,
  });
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, isPrimary: true, pointerType: "mouse" });
  return trigger;
}

describe("AnalyticsPage insights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the financial overview, trend, and vehicle insight sections", () => {
    render(<AnalyticsPage />);

    expect(screen.getByText("إجمالي الإيرادات")).toBeInTheDocument();
    expect(screen.getByText("اتجاه أداء الأعمال 2025")).toBeInTheDocument();
    expect(screen.getByText("رؤى السيارات")).toBeInTheDocument();
    expect(
      screen.getByText("لا توجد بيانات أداء لهذه السنة"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("لا توجد بيانات كافية لرؤى السيارات"),
    ).toBeInTheDocument();
  });

  it("updates the trend period when the selected year changes", () => {
    render(<AnalyticsPage />);

    openSelect("سنة التحليل");
    fireEvent.click(screen.getByRole("option", { name: "2024" }));

    expect(screen.getByText("اتجاه أداء الأعمال 2024")).toBeInTheDocument();
  });

  it("keeps each period label, value, and chevron in one compact control", () => {
    render(<AnalyticsPage />);

    ["سنة التحليل", "شهر الملخص"].forEach((label) => {
      const trigger = screen.getByRole("combobox", { name: label });

      expect(trigger).toHaveClass("h-11", "w-auto", "justify-start", "gap-2");
      expect(trigger).toHaveClass("[&>svg]:shrink-0", "[&>svg]:opacity-100");
    });
  });

  it("opens the month selector from its trigger and chevron", () => {
    render(<AnalyticsPage />);

    const monthTrigger = openSelect("شهر الملخص");
    expect(screen.getByRole("option", { name: "تشرين الثاني" })).toBeInTheDocument();

    fireEvent.keyDown(monthTrigger, { key: "Escape" });
    const chevron = monthTrigger.lastElementChild!;
    Object.assign(chevron, {
      hasPointerCapture: () => false,
      setPointerCapture: () => undefined,
      releasePointerCapture: () => undefined,
    });
    fireEvent.pointerDown(chevron, { button: 0, ctrlKey: false, isPrimary: true, pointerType: "mouse" });

    expect(screen.getByRole("option", { name: "تشرين الأول" })).toBeInTheDocument();
  });

  it("makes the financial summary month explicit and lets it change", () => {
    render(<AnalyticsPage />);

    expect(screen.getAllByText("كانون الثاني 2025").length).toBeGreaterThan(0);
    openSelect("شهر الملخص");
    fireEvent.click(screen.getByRole("option", { name: "آذار" }));

    expect(screen.getAllByText("آذار 2025").length).toBeGreaterThan(0);
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

    expect(
      screen.getAllByLabelText("جارٍ تحميل البيانات").length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.queryByText("لا توجد بيانات أداء لهذه السنة"),
    ).not.toBeInTheDocument();
  });
});
