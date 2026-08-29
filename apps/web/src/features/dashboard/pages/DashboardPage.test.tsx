import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Router } from "wouter";
import { useLocation } from "wouter";
import DashboardPage from "./DashboardPage";
import type { TaskResponse } from "@workspace/api-client-react";

function LocationProbe({ onLocation }: { onLocation: (loc: string) => void }) {
  const [location] = useLocation();
  onLocation(location);
  return null;
}

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
    totalOutstanding: 0,
    rentals: [],
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

vi.mock("@/features/tasks/hooks", () => ({
  useTasks: vi.fn(),
}));

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@workspace/api-client-react")>();
  return {
    ...actual,
    useListVehicles: vi.fn(),
    useListRentals: vi.fn(),
    useListCustomers: vi.fn(),
  };
});

import { useTasks } from "@/features/tasks/hooks";
import { usePayments } from "@/features/payments/hooks";
import {
  useListCustomers,
  useListRentals,
  useListVehicles,
} from "@workspace/api-client-react";

const mockedUseTasks = vi.mocked(useTasks);
const mockedUsePayments = vi.mocked(usePayments);
const mockedUseListVehicles = vi.mocked(useListVehicles);
const mockedUseListRentals = vi.mocked(useListRentals);
const mockedUseListCustomers = vi.mocked(useListCustomers);

function makeTask(overrides: Partial<TaskResponse>): TaskResponse {
  return {
    id: `t-${Math.random()}`,
    dueDate: "2026-09-01T12:00:00Z",
    status: "PENDING",
    recurrenceType: "NONE",
    predecessorId: null,
    notes: null,
    createdAt: "2026-08-01T12:00:00Z",
    updatedAt: "2026-08-01T12:00:00Z",
    ...overrides,
  };
}

function mockTasks(
  tasks: TaskResponse[],
  overrides: Partial<ReturnType<typeof useTasks>> = {},
) {
  mockedUseTasks.mockReturnValue({
    data: { data: tasks },
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useTasks>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseListVehicles.mockReturnValue({
    data: { data: [] },
    isLoading: false,
    error: null,
  } as ReturnType<typeof useListVehicles>);
  mockedUseListRentals.mockReturnValue({
    data: { data: [] },
    isLoading: false,
    error: null,
  } as ReturnType<typeof useListRentals>);
  mockedUseListCustomers.mockReturnValue({
    data: { data: [] },
    isLoading: false,
    error: null,
  } as ReturnType<typeof useListCustomers>);
  mockTasks([]);
  mockedUsePayments.mockReturnValue({
    data: { data: [] },
    payments: [],
    isLoading: false,
    isError: false,
    error: null,
  } as ReturnType<typeof usePayments>);
});

describe("DashboardPage operational dashboard", () => {
  it("renders the operational, fleet, and financial dashboard sections", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("region", { name: "التنبيهات التشغيلية" }),
    ).toBeInTheDocument();
    expect(screen.getByText("حالة الأسطول")).toBeInTheDocument();
    expect(screen.getByText("الملخص المالي")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "إعادة مركبة" }),
    ).toBeInTheDocument();
  });

  it("does not show a misleading financial value while data is loading", () => {
    mockedUsePayments.mockReturnValue({
      data: undefined,
      payments: [],
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof usePayments>);

    render(<DashboardPage />);

    expect(screen.getByLabelText("جارٍ تحميل الإيرادات")).toBeInTheDocument();
    expect(
      screen.queryByText("USD 0", { selector: "p" }),
    ).not.toBeInTheDocument();
  });

  it("shows the pending task count", () => {
    mockTasks([
      makeTask({ id: "t1", status: "PENDING" }),
      makeTask({ id: "t2", status: "COMPLETED" }),
    ]);

    render(<DashboardPage />);

    const tasksButton = screen.getByRole("button", { name: /المهام المفتوحة/ });
    expect(tasksButton).toBeInTheDocument();
    expect(tasksButton.textContent).toContain("1");
  });

  it("renders active rental rows from API rental, vehicle, and customer data", () => {
    mockedUseListRentals.mockReturnValue({
      data: { data: [{
        id: "rental-1", customerId: "customer-1", vehicleId: "vehicle-1",
        pickupDate: "2026-08-01T09:00:00Z", expectedReturnDate: "2026-09-01T09:00:00Z",
        status: "ACTIVE", dailyRate: 100, totalAmount: 500, depositAmount: 100,
        createdAt: "2026-08-01T09:00:00Z", updatedAt: "2026-08-01T09:00:00Z",
      }] }, isLoading: false, error: null,
    } as ReturnType<typeof useListRentals>);
    mockedUseListVehicles.mockReturnValue({
      data: { data: [{
        id: "vehicle-1", make: "Toyota", model: "Yaris", plateNumber: "A-1", year: 2024,
        color: "White", transmission: "AUTOMATIC", fuelType: "PETROL", seats: 5,
        currentMileage: 0, status: "RENTED", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
      }] }, isLoading: false, error: null,
    } as ReturnType<typeof useListVehicles>);
    mockedUseListCustomers.mockReturnValue({
      data: { data: [{
        id: "customer-1", firstName: "أحمد", lastName: "علي", phone: "0500000000",
        address: "الرياض", nationalId: "123", licenseNumber: "456", licenseExpiryDate: "2027-01-01",
        createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
      }] }, isLoading: false, error: null,
    } as ReturnType<typeof useListCustomers>);

    render(<DashboardPage />);

    expect(screen.getByText("أحمد علي")).toBeInTheDocument();
    expect(screen.getByText(/Toyota Yaris/)).toBeInTheDocument();
  });

  it("shows an overdue indicator when a pending task is overdue", () => {
    mockTasks([
      makeTask({
        id: "t1",
        status: "PENDING",
        dueDate: "2026-01-01T12:00:00Z",
      }),
    ]);

    render(<DashboardPage />);

    const tasksButton = screen.getByRole("button", { name: /المهام المفتوحة/ });
    expect(tasksButton.textContent).toContain("متأخرة");
  });

  it("does not render a misleading count while loading", () => {
    mockTasks([], { isLoading: true, data: undefined });

    render(<DashboardPage />);

    expect(
      screen.getByLabelText("جارٍ تحميل المهام المفتوحة"),
    ).toBeInTheDocument();
  });

  it("shows unavailable rental data instead of an empty-state zero after an API failure", () => {
    mockedUseListRentals.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("rentals unavailable"),
    } as ReturnType<typeof useListRentals>);

    render(<DashboardPage />);

    expect(screen.getByText("تعذر تحميل الإيجارات النشطة")).toBeInTheDocument();
    expect(screen.queryByText("لا توجد إيجارات نشطة حالياً.")).not.toBeInTheDocument();
  });

  it("navigates to the tasks view when clicked", () => {
    mockTasks([makeTask({ id: "t1", status: "PENDING" })]);

    const locations: string[] = [];
    render(
      <Router>
        <DashboardPage />
        <LocationProbe onLocation={(loc) => locations.push(loc)} />
      </Router>,
    );

    const tasksButton = screen.getByRole("button", { name: /المهام المفتوحة/ });
    fireEvent.click(tasksButton);

    expect(locations[locations.length - 1]).toBe("/tasks");
  });
});
