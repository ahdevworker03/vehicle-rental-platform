import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import TasksPage from "@/pages/TasksPage";
import type { TaskResponse } from "@workspace/api-client-react";

vi.mock("@/features/tasks/hooks", () => ({
  useTasks: vi.fn(),
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

import { useTasks } from "@/features/tasks/hooks";
import { useAuth } from "@/providers/AuthProvider";

const mockedUseTasks = vi.mocked(useTasks);
const mockedUseAuth = vi.mocked(useAuth);

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

function mockAuth(role = "OWNER") {
  mockedUseAuth.mockReturnValue({ user: { role } } as ReturnType<typeof useAuth>);
}

function mockQuery(overrides: Partial<ReturnType<typeof useTasks>>) {
  mockedUseTasks.mockReturnValue({
    data: { data: [] },
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useTasks>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TasksPage", () => {
  it("renders API data", () => {
    mockQuery({
      data: {
        data: [makeTask({ id: "t1", notes: "تجديد التأمين", status: "PENDING" })],
      },
    });

    render(<TasksPage />);
    expect(screen.getByText("تجديد التأمين")).toBeInTheDocument();
  });

  it("shows a loading state without rendering an empty state", () => {
    mockQuery({ isLoading: true, data: undefined });
    const { container } = render(<TasksPage />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(screen.queryByText("لا توجد مهام")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no tasks", () => {
    mockQuery({ data: { data: [] } });
    render(<TasksPage />);
    expect(screen.getByText("لا توجد مهام")).toBeInTheDocument();
  });

  it("shows an API error state", () => {
    mockQuery({
      isError: true,
      error: new Error("boom"),
      data: undefined,
    });
    render(<TasksPage />);
    expect(screen.getAllByText(/حدث خطأ/).length).toBeGreaterThan(0);
  });

  it("filters tasks by search", () => {
    vi.useFakeTimers();
    mockQuery({
      data: {
        data: [
          makeTask({ id: "t1", notes: "تجديد التأمين" }),
          makeTask({ id: "t2", notes: "فحص السيارة" }),
        ],
      },
    });
    render(<TasksPage />);
    fireEvent.change(screen.getByPlaceholderText("ابحث في الملاحظات..."), {
      target: { value: "تأمين" },
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText("تجديد التأمين")).toBeInTheDocument();
    expect(screen.queryByText("فحص السيارة")).not.toBeInTheDocument();
  });

  it("filters tasks by status", () => {
    mockQuery({
      data: {
        data: [
          makeTask({ id: "t1", status: "PENDING", notes: "أ" }),
          makeTask({ id: "t2", status: "COMPLETED", notes: "ب" }),
        ],
      },
    });
    render(<TasksPage />);
    fireEvent.click(screen.getByRole("button", { name: "مكتملة" }));
    expect(screen.getByText("ب")).toBeInTheDocument();
    expect(screen.queryByText("أ")).not.toBeInTheDocument();
  });

  it("combines search and status filters", () => {
    vi.useFakeTimers();
    mockQuery({
      data: {
        data: [
          makeTask({ id: "t1", status: "PENDING", notes: "تجديد التأمين" }),
          makeTask({ id: "t2", status: "COMPLETED", notes: "تجديد التأمين" }),
          makeTask({ id: "t3", status: "PENDING", notes: "فحص" }),
        ],
      },
    });
    render(<TasksPage />);
    fireEvent.click(screen.getByRole("button", { name: "قيد الانتظار" }));
    fireEvent.change(screen.getByPlaceholderText("ابحث في الملاحظات..."), {
      target: { value: "تأمين" },
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText("تجديد التأمين")).toBeInTheDocument();
    expect(screen.queryByText("فحص")).not.toBeInTheDocument();
  });
});
