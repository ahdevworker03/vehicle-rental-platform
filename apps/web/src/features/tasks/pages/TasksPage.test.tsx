import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import TasksPage from "./TasksPage";
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
    recurrenceInterval: null,
    recurrenceUnit: null,
    recurrenceEndDate: null,
    recurrenceEndCount: null,
    occurrenceNumber: 1,
    predecessorId: null,
    notes: null,
    createdAt: "2026-08-01T12:00:00Z",
    updatedAt: "2026-08-01T12:00:00Z",
    ...overrides,
    title: overrides.title ?? "مهمة تجريبية",
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
        data: [makeTask({ id: "t1", title: "تجديد التأمين", notes: "تفصيل اختياري", status: "PENDING" })],
      },
    });

    render(<TasksPage />);
    expect(screen.getAllByText("تجديد التأمين").length).toBeGreaterThan(0);
    expect(screen.queryByText("تفصيل اختياري")).not.toBeInTheDocument();
  });

  it("uses the same fixed width and logical alignment for due-date headers and cells", () => {
    mockQuery({
      data: { data: [makeTask({ id: "aligned", title: "فحص المركبة" })] },
    });
    render(<TasksPage />);

    expect(screen.getByTestId("tasks-due-date-header").className).toContain("w-[18%] text-start");
    expect(screen.getByTestId("tasks-due-date-cell").className).toContain("w-[18%] text-start");
  });

  it("uses a shared RTL-start-aligned identity wrapper for desktop titles and IDs", () => {
    const shortTitle = "فحص";
    const longTitle = "Annual vehicle insurance renewal review before the policy expiration date";
    mockQuery({
      data: {
        data: [
          makeTask({ id: "short123-task", title: shortTitle }),
          makeTask({ id: "longabcd-task", title: longTitle }),
        ],
      },
    });

    render(<TasksPage />);

    const desktopTitle = screen
      .getAllByText(longTitle)
      .find((element) => element.classList.contains("break-words"));
    const desktopIds = ["#short123", "#longabcd"].map((id) =>
      screen.getAllByText(id).find((element) => element.classList.contains("text-right")),
    );

    expect(desktopTitle).toHaveClass("break-words", "text-start");
    desktopIds.forEach((id) => {
      expect(id).toHaveClass("number-ltr", "text-right");
      expect(id?.parentElement).toHaveClass("flex", "flex-1", "min-w-0", "text-start");
    });
  });

  it("renders tasks that use the interval recurrence response shape", () => {
    mockQuery({
      data: {
        data: [makeTask({ id: "recurring", title: "متابعة التأمين", recurrenceInterval: 2, recurrenceUnit: "WEEK", recurrenceEndCount: 5 })],
      },
    });
    render(<TasksPage />);
    expect(screen.getAllByText("متابعة التأمين").length).toBeGreaterThan(0);
  });

  it("keeps mobile task titles ahead of secondary metadata and status", () => {
    const title = "مهمة متابعة دورية طويلة لملف التأمين الخاص بالمركبة";
    mockQuery({
      data: { data: [makeTask({ id: "mobile-task", title, status: "COMPLETED" })] },
    });

    render(<TasksPage />);

    const mobileTitle = screen
      .getAllByText(title)
      .find((element) => element.classList.contains("line-clamp-2"));
    const mobileId = screen
      .getAllByText("#mobile-t")
      .find((element) => element.classList.contains("truncate"));

    expect(mobileTitle).toHaveClass("text-end");
    expect(mobileTitle?.parentElement).toHaveClass("flex-1", "min-w-0");
    expect(mobileId).toHaveClass("max-w-full", "text-start", "truncate");
  });

  it("shows a loading state without rendering an empty state", () => {
    mockQuery({ isLoading: true, data: undefined });
    render(<TasksPage />);
    expect(screen.getByLabelText("جارٍ تحميل المهام")).toBeInTheDocument();
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
    expect(screen.getAllByText(/تعذر تحميل المهام/).length).toBeGreaterThan(0);
  });

  it("filters tasks by search", () => {
    vi.useFakeTimers();
    mockQuery({
      data: {
        data: [
          makeTask({ id: "t1", title: "تجديد التأمين" }),
          makeTask({ id: "t2", title: "فحص السيارة" }),
        ],
      },
    });
    render(<TasksPage />);
    fireEvent.change(screen.getByPlaceholderText("ابحث في المهام..."), {
      target: { value: "تأمين" },
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getAllByText("تجديد التأمين").length).toBeGreaterThan(0);
    expect(screen.queryByText("فحص السيارة")).not.toBeInTheDocument();
  });

  it("filters tasks by status", () => {
    mockQuery({
      data: {
        data: [
          makeTask({ id: "t1", status: "PENDING", title: "أ" }),
          makeTask({ id: "t2", status: "COMPLETED", title: "ب" }),
        ],
      },
    });
    render(<TasksPage />);
    fireEvent.click(screen.getByRole("button", { name: "مكتملة" }));
    expect(screen.getAllByText("ب").length).toBeGreaterThan(0);
    expect(screen.queryByText("أ")).not.toBeInTheDocument();
  });

  it("shows only overdue tasks from the overdue alert", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-15T12:00:00Z"));
    mockQuery({
      data: {
        data: [
          makeTask({ id: "overdue", dueDate: "2026-08-10T12:00:00Z", title: "متأخرة" }),
          makeTask({ id: "upcoming", dueDate: "2026-08-20T12:00:00Z", title: "قادمة" }),
        ],
      },
    });

    render(<TasksPage />);
    fireEvent.click(screen.getByRole("button", { name: /عرض المهمة المتأخرة/ }));

    expect(screen.getAllByText("متأخرة").length).toBeGreaterThan(0);
    expect(screen.queryByText("قادمة")).not.toBeInTheDocument();
  });

  it("combines search and status filters", () => {
    vi.useFakeTimers();
    mockQuery({
      data: {
        data: [
          makeTask({ id: "t1", status: "PENDING", title: "تجديد التأمين" }),
          makeTask({ id: "t2", status: "COMPLETED", title: "تجديد التأمين" }),
          makeTask({ id: "t3", status: "PENDING", title: "فحص" }),
        ],
      },
    });
    render(<TasksPage />);
    fireEvent.click(screen.getByRole("button", { name: "قيد الانتظار" }));
    fireEvent.change(screen.getByPlaceholderText("ابحث في المهام..."), {
      target: { value: "تأمين" },
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getAllByText("تجديد التأمين").length).toBeGreaterThan(0);
    expect(screen.queryByText("فحص")).not.toBeInTheDocument();
  });
});
