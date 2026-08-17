import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskDetailPage from "@/pages/TaskDetailPage";
import { ApiError, type TaskResponse } from "@workspace/api-client-react";

function makeApiError(message: string): ApiError {
  const response = new Response(null, { status: 409, statusText: "Conflict" });
  return new ApiError(
    response,
    { error: { code: "TASK_ALREADY_COMPLETED", message } },
    { method: "POST", url: "/api/tasks/task-1/complete" },
  );
}

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

function makeTask(overrides: Partial<TaskResponse>): TaskResponse {
  return {
    id: "task-1",
    dueDate: "2026-09-01T12:00:00Z",
    status: "PENDING",
    notes: "تجديد التأمين",
    createdAt: "2026-08-01T12:00:00Z",
    updatedAt: "2026-08-01T12:00:00Z",
    ...overrides,
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

function mockComplete() {
  const complete = {
    isPending: false,
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  };
  mockedUseTaskMutations.mockReturnValue({
    complete,
  } as unknown as ReturnType<typeof useTaskMutations>);
  return complete;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth();
  mockComplete();
});

describe("TaskDetailPage", () => {
  it("shows task details for a pending task", () => {
    mockTask(makeTask());
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.getAllByText("تجديد التأمين").length).toBeGreaterThan(0);
    expect(screen.getAllByText("قيد الانتظار").length).toBeGreaterThan(0);
  });

  it("shows the completion action for a pending task", () => {
    mockTask(makeTask({ status: "PENDING" }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.getByText("إكمال المهمة")).toBeInTheDocument();
  });

  it("completes a pending task via the dedicated completion API", async () => {
    const complete = mockComplete();
    mockTask(makeTask({ status: "PENDING" }));

    render(<TaskDetailPage params={{ id: "task-1" }} />);
    fireEvent.click(screen.getByText("إكمال المهمة"));
    fireEvent.click(screen.getByText("تأكيد الإكمال"));

    await waitFor(() => {
      expect(complete.mutateAsync).toHaveBeenCalledWith({ id: "task-1" });
    });
  });

  it("shows success feedback after completion", async () => {
    mockComplete();
    mockTask(makeTask({ status: "PENDING" }));

    render(<TaskDetailPage params={{ id: "task-1" }} />);
    fireEvent.click(screen.getByText("إكمال المهمة"));
    fireEvent.click(screen.getByText("تأكيد الإكمال"));

    expect(await screen.findByText("تم إكمال المهمة بنجاح")).toBeInTheDocument();
  });

  it("does not show an active completion action for a completed task", () => {
    mockTask(makeTask({ status: "COMPLETED" }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.getAllByText("مكتملة").length).toBeGreaterThan(0);
    expect(screen.queryByText("إكمال المهمة")).not.toBeInTheDocument();
    expect(screen.getByText("هذه المهمة مكتملة")).toBeInTheDocument();
  });

  it("shows an API error without false success", async () => {
    const complete = mockComplete();
    complete.mutateAsync.mockRejectedValue(makeApiError("المهمة مكتملة بالفعل"));
    mockTask(makeTask({ status: "PENDING" }));

    render(<TaskDetailPage params={{ id: "task-1" }} />);
    fireEvent.click(screen.getByText("إكمال المهمة"));
    fireEvent.click(screen.getByText("تأكيد الإكمال"));

    expect(await screen.findByText("المهمة مكتملة بالفعل")).toBeInTheDocument();
    expect(screen.queryByText("تم إكمال المهمة بنجاح")).not.toBeInTheDocument();
  });

  it("does not show a completion action for a non-owner", () => {
    mockAuth("EMPLOYEE");
    mockTask(makeTask({ status: "PENDING" }));
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.queryByText("إكمال المهمة")).not.toBeInTheDocument();
  });

  it("shows the error/empty state when the task is not found", () => {
    mockTask(null, { isError: true, error: new Error("Task not found") });
    render(<TaskDetailPage params={{ id: "task-1" }} />);
    expect(screen.getByText(/لا توجد بيانات/)).toBeInTheDocument();
  });
});
