import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError, type TaskResponse } from "@workspace/api-client-react";

import TaskDetailPage from "./TaskDetailPage";

const setLocationMock = vi.hoisted(() => vi.fn());

function makeApiError(message: string): ApiError {
  const response = new Response(null, { status: 409, statusText: "Conflict" });
  return new ApiError(
    response,
    { error: { code: "TASK_ALREADY_COMPLETED", message } },
    { method: "POST", url: "/api/tasks/task-1/complete" },
  );
}

vi.mock("wouter", async (importOriginal) => {
  const original = await importOriginal<typeof import("wouter")>();
  return { ...original, useLocation: () => ["/tasks/task-1", setLocationMock] };
});

vi.mock("@/features/tasks/hooks", () => ({
  useTask: vi.fn(),
  useTaskMutations: vi.fn(),
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

import { useTask, useTaskMutations } from "@/features/tasks/hooks";
import { useAuth } from "@/providers/AuthProvider";

const mockedUseTask = vi.mocked(useTask);
const mockedUseTaskMutations = vi.mocked(useTaskMutations);
const mockedUseAuth = vi.mocked(useAuth);

function makeTask(overrides: Partial<TaskResponse> = {}): TaskResponse {
  return {
    id: "task-1",
    dueDate: "2026-09-01T12:00:00Z",
    status: "PENDING",
    recurrenceInterval: null,
    recurrenceUnit: null,
    recurrenceEndDate: null,
    recurrenceEndCount: null,
    occurrenceNumber: 1,
    predecessorId: null,
    notes: "تجديد التأمين",
    createdAt: "2026-08-01T12:00:00Z",
    updatedAt: "2026-08-01T12:00:00Z",
    ...overrides,
    title: overrides.title ?? "تجديد تأمين المركبة",
  };
}

function mockAuth(role = "OWNER") {
  mockedUseAuth.mockReturnValue({ user: { role } } as ReturnType<typeof useAuth>);
}

function mockTask(task: TaskResponse | null, overrides: Partial<ReturnType<typeof useTask>> = {}) {
  mockedUseTask.mockReturnValue({
    data: task ? { data: task } : undefined,
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useTask>);
}

function mockMutations() {
  const mutations = {
    create: { isPending: false, mutateAsync: vi.fn().mockResolvedValue(undefined) },
    complete: { isPending: false, mutateAsync: vi.fn().mockResolvedValue(undefined) },
    update: { isPending: false, mutateAsync: vi.fn().mockResolvedValue(undefined) },
    remove: { isPending: false, mutateAsync: vi.fn().mockResolvedValue(undefined) },
  };
  mockedUseTaskMutations.mockReturnValue(mutations as unknown as ReturnType<typeof useTaskMutations>);
  return mutations;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth();
  mockMutations();
});

describe("TaskDetailPage", () => {
  it("uses the title as the task identity and keeps notes in their section", () => {
    mockTask(makeTask({ title: "فحص السيارة", notes: "راجع الإطارات أيضاً" }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);

    expect(screen.getAllByText("فحص السيارة").length).toBeGreaterThan(0);
    expect(screen.getByText("راجع الإطارات أيضاً")).toBeInTheDocument();
  });

  it("keeps the title when notes are unavailable", () => {
    mockTask(makeTask({ title: "تجديد الترخيص", notes: null }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);

    expect(screen.getAllByText("تجديد الترخيص").length).toBeGreaterThan(0);
    expect(screen.getByText("لا توجد ملاحظات لهذه المهمة.")).toBeInTheDocument();
  });

  it("keeps due-date labels and numeric values in matching field structure", () => {
    mockTask(makeTask());
    render(<TaskDetailPage params={{ id: "task-1" }} />);

    const dueLabels = screen.getAllByText("تاريخ الاستحقاق");
    expect(dueLabels).toHaveLength(2);
    for (const label of dueLabels) {
      expect(label.parentElement?.className).toContain("min-w-0");
      expect(label.nextElementSibling?.className).toContain("text-end");
    }
  });
  it("shows the new recurrence and end-date summaries", () => {
    mockTask(makeTask({
      recurrenceInterval: 15,
      recurrenceUnit: "DAY",
      recurrenceEndDate: "2026-12-31",
    }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.getAllByText("كل 15 يوم").length).toBeGreaterThan(0);
    expect(screen.getByText("حتى 31/12/2026")).toBeInTheDocument();
  });

  it("shows an occurrence-count end summary", () => {
    mockTask(makeTask({ recurrenceInterval: 1, recurrenceUnit: "WEEK", recurrenceEndCount: 5 }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.getAllByText("أسبوعي").length).toBeGreaterThan(0);
    expect(screen.getByText("بعد 5 مرات")).toBeInTheDocument();
  });

  it("shows previous-occurrence context for a generated task", () => {
    mockTask(makeTask({ occurrenceNumber: 2, predecessorId: "previous-task-id" }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.getByText("المهمة السابقة")).toBeInTheDocument();
    expect(screen.getByText("التكرار رقم 1")).toBeInTheDocument();
  });

  it("does not show previous-occurrence context for an original task", () => {
    mockTask(makeTask());
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.queryByText("المهمة السابقة")).not.toBeInTheDocument();
  });

  it("shows Stop Recurrence only for a pending recurring task", () => {
    mockTask(makeTask({ recurrenceInterval: 2, recurrenceUnit: "WEEK" }));
    const { rerender } = render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.getByRole("button", { name: "إيقاف التكرار" })).toBeInTheDocument();

    mockTask(makeTask());
    rerender(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.queryByRole("button", { name: "إيقاف التكرار" })).not.toBeInTheDocument();
  });

  it("stops recurrence by clearing all recurrence fields", async () => {
    const mutations = mockMutations();
    mockTask(makeTask({ recurrenceInterval: 1, recurrenceUnit: "MONTH", recurrenceEndCount: 5 }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    fireEvent.click(screen.getByRole("button", { name: "إيقاف التكرار" }));
    expect(screen.getByText(/ستبقى المهمة الحالية وسجل المهام السابقة/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "تأكيد الإيقاف" }));

    await waitFor(() => expect(mutations.update.mutateAsync).toHaveBeenCalledWith({
      id: "task-1",
      data: {
        recurrence_interval: null,
        recurrence_unit: null,
        recurrence_end_date: null,
        recurrence_end_count: null,
      },
    }));
  });

  it("does not expose Stop Recurrence for a completed recurring task", () => {
    mockTask(makeTask({ status: "COMPLETED", recurrenceInterval: 1, recurrenceUnit: "DAY" }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.queryByRole("button", { name: "إيقاف التكرار" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "إكمال المهمة" })).not.toBeInTheDocument();
    expect(screen.getAllByText("يومي").length).toBeGreaterThan(0);
  });

  it("deletes only the selected task and navigates back to the list", async () => {
    const mutations = mockMutations();
    mockTask(makeTask({ recurrenceInterval: 1, recurrenceUnit: "DAY" }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    fireEvent.click(screen.getByRole("button", { name: "حذف المهمة" }));
    expect(screen.getByText(/ستُحذف المهمة المحددة من القوائم والعروض المعتادة فقط/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "تأكيد الحذف" }));

    await waitFor(() => expect(mutations.remove.mutateAsync).toHaveBeenCalledWith({ id: "task-1" }));
    expect(setLocationMock).toHaveBeenCalledWith("/tasks");
  });

  it("completes a pending task via the dedicated completion API", async () => {
    const mutations = mockMutations();
    mockTask(makeTask());
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    fireEvent.click(screen.getByRole("button", { name: "إكمال المهمة" }));
    fireEvent.click(screen.getByRole("button", { name: "تأكيد الإكمال" }));
    await waitFor(() => expect(mutations.complete.mutateAsync).toHaveBeenCalledWith({ id: "task-1" }));
  });

  it("edits a pending task with interval recurrence fields", async () => {
    const mutations = mockMutations();
    mockTask(makeTask({ recurrenceInterval: 1, recurrenceUnit: "DAY" }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    fireEvent.click(screen.getByRole("button", { name: "تعديل المهمة" }));
    fireEvent.change(screen.getByLabelText(/اسم المهمة/), { target: { value: "تجديد الفحص" } });
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: "CUSTOM" } });
    fireEvent.change(screen.getByLabelText(/الفاصل/), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/الوحدة/), { target: { value: "MONTH" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ التعديلات" }));

    await waitFor(() => expect(mutations.update.mutateAsync).toHaveBeenCalledWith({
      id: "task-1",
      data: expect.objectContaining({ title: "تجديد الفحص", recurrence_interval: 4, recurrence_unit: "MONTH" }),
    }));
  });

  it("shows an API error without false success", async () => {
    const mutations = mockMutations();
    mutations.complete.mutateAsync.mockRejectedValue(makeApiError("المهمة مكتملة بالفعل"));
    mockTask(makeTask());
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    fireEvent.click(screen.getByRole("button", { name: "إكمال المهمة" }));
    fireEvent.click(screen.getByRole("button", { name: "تأكيد الإكمال" }));
    expect(await screen.findByText("المهمة مكتملة بالفعل")).toBeInTheDocument();
    expect(screen.queryByText("تم إكمال المهمة.")).not.toBeInTheDocument();
  });

  it("does not show owner actions for an employee", () => {
    mockAuth("EMPLOYEE");
    mockTask(makeTask({ recurrenceInterval: 1, recurrenceUnit: "DAY" }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.queryByRole("button", { name: "إكمال المهمة" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "إيقاف التكرار" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "حذف المهمة" })).not.toBeInTheDocument();
  });

  it("shows the error state when the task is not found", () => {
    mockTask(null, { isError: true, error: new Error("Task not found") });
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.getByText(/تعذر تحميل المهمة/)).toBeInTheDocument();
  });
});
