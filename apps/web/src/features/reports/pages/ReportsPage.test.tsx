import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReportsPage from "./ReportsPage";

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
    expect(screen.getAllByText("الإيرادات").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("المصروفات").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("صافي الربح").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("تكلفة الصيانة").length).toBeGreaterThanOrEqual(
      2,
    );
    expect(screen.getAllByText("USD 0").length).toBeGreaterThanOrEqual(3);
  });

  it("renders summary cards with computed values from data", () => {
    mockData({
      payments: [
        {
          id: "p1",
          rentalId: "r1",
          amount: 100,
          paymentDate: new Date().toISOString(),
          method: "CASH",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      expenses: [
        {
          id: "e1",
          vehicleId: null,
          expenseDate: new Date().toISOString(),
          amount: 40,
          category: "FUEL",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
    render(<ReportsPage />);
    expect(screen.getAllByText("USD 100").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("USD 40").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("USD 60").length).toBeGreaterThanOrEqual(2); // net profit
  });

  it("shows loading state while data is loading", () => {
    mockData({ isLoading: true });
    render(<ReportsPage />);
    expect(
      screen.getAllByLabelText("جارٍ تحميل البيانات").length,
    ).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("الإيرادات")).not.toBeInTheDocument();
  });

  it("shows error state when data fails to load", () => {
    mockData({ isError: true, error: new Error("boom") });
    render(<ReportsPage />);
    expect(screen.getByText("تعذر تحميل التقرير")).toBeInTheDocument();
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

  it("writes the printable report into the opened window", () => {
    const document = {
      open: vi.fn(),
      write: vi.fn(),
      close: vi.fn(),
    };
    const popup = { document } as unknown as Window;
    const open = vi.spyOn(window, "open").mockReturnValue(popup);

    render(<ReportsPage />);
    fireEvent.click(screen.getByRole("button", { name: /طباعة/ }));

    expect(open).toHaveBeenCalledWith("", "_blank");
    expect(document.open).toHaveBeenCalledOnce();
    expect(document.write).toHaveBeenCalledWith(
      expect.stringContaining("<!DOCTYPE html>"),
    );
    expect(document.close).toHaveBeenCalledOnce();

    open.mockRestore();
  });

  it("preserves the selected period when print preview is blocked", () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    render(<ReportsPage />);
    fireEvent.click(screen.getByRole("button", { name: /طباعة/ }));

    expect(screen.getByText(/تعذر فتح معاينة طباعة تقرير/)).toBeInTheDocument();
    expect(screen.getByText("تقرير الفترة المحددة")).toBeInTheDocument();
    vi.mocked(window.open).mockRestore();
  });

  it("exports the summary as a CSV download", () => {
    const createObjectURL = vi.fn(() => "blob:report");
    const revokeObjectURL = vi.fn();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

    render(<ReportsPage />);
    fireEvent.click(screen.getByRole("button", { name: /CSV/ }));

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:report");
    expect(screen.getByText(/تم تجهيز ملف CSV/)).toBeInTheDocument();

    click.mockRestore();
    vi.unstubAllGlobals();
  });

  it("switches period type when tab is clicked", () => {
    render(<ReportsPage />);
    fireEvent.click(screen.getByRole("tab", { name: "سنة" }));
    expect(screen.getByRole("tab", { name: "سنة" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
