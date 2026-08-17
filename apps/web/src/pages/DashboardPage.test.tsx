import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Router } from "wouter";
import { useLocation } from "wouter";
import DashboardPage from "@/pages/DashboardPage";
import type { TaskResponse } from "@workspace/api-client-react";

function LocationProbe({ onLocation }: { onLocation: (loc: string) => void }) {
  const [location] = useLocation();
  onLocation(location);
  return null;
}

vi.mock("@/features/vehicles/hooks", () => ({
  useVehicles: vi.fn(() => []),
  useVehicleById: vi.fn(() => () => undefined),
}));

vi.mock("@/features/rentals/hooks", () => ({
  useRentals: vi.fn(() => []),
}));

vi.mock("@/features/maintenance/hooks", () => ({
  useMaintenance: vi.fn(() => ({ data: { data: [] }, isLoading: false, isError: false, error: null })),
}));

vi.mock("@/features/expenses/hooks", () => ({
  useExpenses: vi.fn(() => ({ data: { data: [] }, isLoading: false, isError: false, error: null })),
}));

vi.mock("@/features/payments/hooks", () => ({
  usePayments: vi.fn(() => ({ data: { data: [] }, payments: [], isLoading: false, isError: false, error: null })),
  useOrgOutstandingBalances: vi.fn(() => ({ balances: [], totalOutstanding: 0, rentals: [], isLoading: false, isError: false, error: null })),
}));

vi.mock("@/features/customers/hooks", () => ({
  useCustomerById: vi.fn(() => () => undefined),
}));

vi.mock("@/features/tasks/hooks", () => ({
  useTasks: vi.fn(),
}));

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@workspace/api-client-react")>();
  return {
    ...actual,
    useListVehicles: vi.fn(() => ({ data: { data: [] } })),
  };
});

import { useTasks } from "@/features/tasks/hooks";

const mockedUseTasks = vi.mocked(useTasks);

function makeTask(overrides: Partial<TaskResponse>): TaskResponse {
  return {
    id: `t-${Math.random()}`,
    dueDate: "2026-09-01T12:00:00Z",
    status: "PENDING",
    notes: null,
    createdAt: "2026-08-01T12:00:00Z",
    updatedAt: "2026-08-01T12:00:00Z",
    ...overrides,
  };
}

function mockTasks(tasks: TaskResponse[], overrides: Partial<ReturnType<typeof useTasks>> = {}) {
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
  mockTasks([]);
});

describe("DashboardPage tasks surface", () => {
  it("shows the pending task count", () => {
    mockTasks([
      makeTask({ id: "t1", status: "PENDING" }),
      makeTask({ id: "t2", status: "COMPLETED" }),
    ]);

    render(<DashboardPage />);

    const tasksButton = screen.getByRole("button", { name: /المهام/ });
    expect(tasksButton).toBeInTheDocument();
    expect(tasksButton.textContent).toContain("1");
  });

  it("shows an overdue indicator when a pending task is overdue", () => {
    mockTasks([
      makeTask({ id: "t1", status: "PENDING", dueDate: "2026-01-01T12:00:00Z" }),
    ]);

    render(<DashboardPage />);

    const tasksButton = screen.getByRole("button", { name: /المهام/ });
    expect(tasksButton.textContent).toContain("متأخرة");
  });

  it("does not render a misleading count while loading", () => {
    mockTasks([], { isLoading: true, data: undefined });

    render(<DashboardPage />);

    const tasksButton = screen.getByRole("button", { name: /المهام/ });
    expect(tasksButton.textContent).toContain("جارٍ التحميل");
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

    const tasksButton = screen.getByRole("button", { name: /المهام/ });
    fireEvent.click(tasksButton);

    expect(locations[locations.length - 1]).toBe("/tasks");
  });
});
