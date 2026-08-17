import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddTaskPage from "@/pages/AddTaskPage";
import { ApiError } from "@workspace/api-client-react";

function makeApiError(message: string): ApiError {
  const response = new Response(null, { status: 422, statusText: "Unprocessable" });
  return new ApiError(
    response,
    { error: { code: "VALIDATION", message } },
    { method: "POST", url: "/api/tasks" },
  );
}

vi.mock("@/features/tasks/hooks", () => ({
  useTaskMutations: vi.fn(),
}));

import { useTaskMutations } from "@/features/tasks/hooks";

const mockedUseTaskMutations = vi.mocked(useTaskMutations);

function mockCreate() {
  const create = {
    isPending: false,
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  };
  mockedUseTaskMutations.mockReturnValue({
    create,
  } as unknown as ReturnType<typeof useTaskMutations>);
  return create;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCreate();
});

describe("AddTaskPage", () => {
  it("renders the required due date and optional notes fields", () => {
    render(<AddTaskPage />);
    expect(screen.getByLabelText(/تاريخ الاستحقاق/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ملاحظات/)).toBeInTheDocument();
  });

  it("rejects submission when the due date is missing", () => {
    render(<AddTaskPage />);
    fireEvent.click(screen.getByText("إنشاء المهمة"));
    expect(screen.getByText("أدخل تاريخ الاستحقاق")).toBeInTheDocument();
  });

  it("calls the API with a valid due date", async () => {
    const create = mockCreate();
    render(<AddTaskPage />);

    fireEvent.change(screen.getByLabelText(/تاريخ الاستحقاق/), {
      target: { value: "2026-09-01" },
    });
    fireEvent.change(screen.getByLabelText(/ملاحظات/), {
      target: { value: "تجديد التأمين" },
    });
    fireEvent.click(screen.getByText("إنشاء المهمة"));

    await waitFor(() => {
      expect(create.mutateAsync).toHaveBeenCalledWith({
        data: {
          due_date: "2026-09-01T12:00:00.000Z",
          notes: "تجديد التأمين",
        },
      });
    });
  });

  it("shows a success state after creation", async () => {
    const create = mockCreate();
    render(<AddTaskPage />);

    fireEvent.change(screen.getByLabelText(/تاريخ الاستحقاق/), {
      target: { value: "2026-09-01" },
    });
    fireEvent.click(screen.getByText("إنشاء المهمة"));

    await waitFor(() => {
      expect(create.mutateAsync).toHaveBeenCalled();
    });
    expect(await screen.findByText("تم إنشاء المهمة")).toBeInTheDocument();
  });

  it("displays a mutation error without false success", async () => {
    const create = mockCreate();
    create.mutateAsync.mockRejectedValue(makeApiError("بيانات غير صالحة"));
    render(<AddTaskPage />);

    fireEvent.change(screen.getByLabelText(/تاريخ الاستحقاق/), {
      target: { value: "2026-09-01" },
    });
    fireEvent.click(screen.getByText("إنشاء المهمة"));

    expect(await screen.findByText("بيانات غير صالحة")).toBeInTheDocument();
    expect(screen.queryByText("تم إنشاء المهمة")).not.toBeInTheDocument();
  });
});
