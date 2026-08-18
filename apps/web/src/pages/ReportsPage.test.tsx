import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReportsPage from "@/pages/ReportsPage";

vi.mock("@/features/reports/hooks", () => ({
  useReportData: vi.fn(),
}));

import { useReportData } from "@/features/reports/hooks";

const mockedUseReportData = vi.mocked(useReportData);

function mockData(overrides: Partial<ReturnType<typeof useReportData>> = {}) {
  mockedUseReportData.mockReturnValue({
    payments: [],
    expenses: [],
    maintenance: [],
    rentals: [],
    tasks: [],
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useReportData>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockData();
});

describe("ReportsPage", () => {
  it("renders the period selector", () => {
    render(<ReportsPage />);
    expect(screen.getAllByRole("tablist").length).toBeGreaterThan(0);
    expect(screen.getByRole("tab", { name: "شهر" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "ربع" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "سنة" })).toBeInTheDocument();
  });

  it("renders summary cards with zero values when data is empty", () => {
    render(<ReportsPage />);
    expect(screen.getByText("الإيرادات")).toBeInTheDocument();
    expect(screen.getByText("المصروفات")).toBeInTheDocument();
    expect(screen.getByText("صافي الربح")).toBeInTheDocument();
    expect(screen.getByText("تكلفة الصيانة")).toBeInTheDocument();
    expect(screen.getAllByText("$0").length).toBeGreaterThanOrEqual(3);
  });

  it("renders summary cards with computed values from data", () => {
    mockData({
      payments: [
        { id: "p1", rentalId: "r1", amount: 100, paymentDate: new Date().toISOString(), method: "CASH", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
      expenses: [
        { id: "e1", vehicleId: null, expenseDate: new Date().toISOString(), amount: 40, category: "FUEL", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
    });
    render(<ReportsPage />);
    expect(screen.getByText("$100")).toBeInTheDocument();
    expect(screen.getByText("$40")).toBeInTheDocument();
    expect(screen.getByText("$60")).toBeInTheDocument(); // net profit
  });

  it("shows loading state while data is loading", () => {
    mockData({ isLoading: true });
    const { container } = render(<ReportsPage />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(screen.queryByText("الإيرادات")).not.toBeInTheDocument();
  });

  it("shows error state when data fails to load", () => {
    mockData({ isError: true, error: new Error("boom") });
    render(<ReportsPage />);
    expect(screen.getAllByText(/حدث خطأ/).length).toBeGreaterThan(0);
  });

  it("shows empty state when period has no activity", () => {
    render(<ReportsPage />);
    expect(screen.getByText("لا يوجد نشاط في هذه الفترة")).toBeInTheDocument();
  });

  it("renders export buttons", () => {
    render(<ReportsPage />);
    expect(screen.getByRole("button", { name: /طباعة/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /CSV/ })).toBeInTheDocument();
  });

  it("switches period type when tab is clicked", () => {
    render(<ReportsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "سنة" }));
    expect(screen.getByRole("tab", { name: "سنة" })).toHaveAttribute("aria-selected", "true");
  });
});
