import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@workspace/api-client-react";

import AddTaskPage from "./AddTaskPage";

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
  mockedUseTaskMutations.mockReturnValue({ create } as unknown as ReturnType<typeof useTaskMutations>);
  return create;
}

function selectDate(label: string | RegExp, value: string) {
  fireEvent.click(screen.getByLabelText(label));

  for (let index = 0; index < 24; index += 1) {
    const day = document.querySelector<HTMLButtonElement>(`button[data-day="${value}"]`);
    if (day) {
      fireEvent.click(day);
      return;
    }
    fireEvent.click(screen.getByRole("button", { name: /next month/i }));
  }

  throw new Error(`Could not find date ${value}`);
}

function enterDueDate() {
  fireEvent.change(screen.getByLabelText(/اسم المهمة/), {
    target: { value: "تجديد تأمين المركبة" },
  });
  selectDate(/تاريخ الاستحقاق/, "2026-09-01");
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "إنشاء المهمة" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCreate();
});

describe("AddTaskPage", () => {
  it("renders the required title and due date fields before optional notes", () => {
    render(<AddTaskPage />);
    expect(screen.getByLabelText(/اسم المهمة/)).toBeRequired();
    expect(screen.getByLabelText(/تاريخ الاستحقاق/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ملاحظات/)).toBeInTheDocument();
  });

  it.each(["", "   "])("rejects an empty title before submit", (title) => {
    const create = mockCreate();
    render(<AddTaskPage />);
    fireEvent.change(screen.getByLabelText(/اسم المهمة/), { target: { value: title } });
    selectDate(/تاريخ الاستحقاق/, "2026-09-01");
    submit();

    expect(screen.getByText("أدخل اسم المهمة.")).toBeInTheDocument();
    expect(create.mutateAsync).not.toHaveBeenCalled();
  });

  it("rejects submission when the due date is missing", () => {
    render(<AddTaskPage />);
    submit();
    expect(screen.getByText("أدخل تاريخ الاستحقاق.")).toBeInTheDocument();
  });

  it("submits no recurrence with every recurrence field cleared", async () => {
    const create = mockCreate();
    render(<AddTaskPage />);
    enterDueDate();
    fireEvent.change(screen.getByLabelText(/ملاحظات/), { target: { value: "تجديد التأمين" } });
    submit();

    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledWith({
      data: {
        title: "تجديد تأمين المركبة",
        due_date: "2026-09-01T12:00:00.000Z",
        notes: "تجديد التأمين",
        recurrence_interval: null,
        recurrence_unit: null,
        recurrence_end_date: null,
        recurrence_end_count: null,
      },
    }));
  });

  it.each([
    ["DAILY", 1, "DAY"],
    ["WEEKLY", 1, "WEEK"],
    ["MONTHLY", 1, "MONTH"],
  ])("maps %s to interval one and its unit", async (mode, interval, unit) => {
    const create = mockCreate();
    render(<AddTaskPage />);
    enterDueDate();
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: mode } });
    submit();

    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recurrence_interval: interval,
        recurrence_unit: unit,
        recurrence_end_date: null,
        recurrence_end_count: null,
      }),
    }));
  });

  it.each([
    ["15", "DAY", 15, "DAY"],
    ["2", "WEEK", 2, "WEEK"],
    ["4", "MONTH", 4, "MONTH"],
  ])("submits custom interval %s %s", async (inputInterval, inputUnit, interval, unit) => {
    const create = mockCreate();
    render(<AddTaskPage />);
    enterDueDate();
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: "CUSTOM" } });
    fireEvent.change(screen.getByLabelText(/الفاصل/), { target: { value: inputInterval } });
    fireEvent.change(screen.getByLabelText(/الوحدة/), { target: { value: inputUnit } });
    submit();

    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledWith({
      data: expect.objectContaining({ recurrence_interval: interval, recurrence_unit: unit }),
    }));
  });

  it("submits an end date without an end count", async () => {
    const create = mockCreate();
    render(<AddTaskPage />);
    enterDueDate();
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: "DAILY" } });
    fireEvent.change(screen.getByLabelText("ينتهي"), { target: { value: "DATE" } });
    selectDate(/تاريخ انتهاء التكرار/, "2026-12-31");
    submit();

    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledWith({
      data: expect.objectContaining({ recurrence_end_date: "2026-12-31", recurrence_end_count: null }),
    }));
  });

  it("submits an end count without an end date", async () => {
    const create = mockCreate();
    render(<AddTaskPage />);
    enterDueDate();
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: "WEEKLY" } });
    fireEvent.change(screen.getByLabelText("ينتهي"), { target: { value: "COUNT" } });
    fireEvent.change(screen.getByLabelText(/عدد المرات/), { target: { value: "5" } });
    submit();

    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledWith({
      data: expect.objectContaining({ recurrence_end_date: null, recurrence_end_count: 5 }),
    }));
  });

  it("clears stale end-condition state when switching types", async () => {
    const create = mockCreate();
    render(<AddTaskPage />);
    enterDueDate();
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: "MONTHLY" } });
    fireEvent.change(screen.getByLabelText("ينتهي"), { target: { value: "DATE" } });
    selectDate(/تاريخ انتهاء التكرار/, "2026-12-31");
    fireEvent.change(screen.getByLabelText("ينتهي"), { target: { value: "COUNT" } });
    expect(screen.queryByLabelText(/تاريخ انتهاء التكرار/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/عدد المرات/), { target: { value: "3" } });
    submit();

    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledWith({
      data: expect.objectContaining({ recurrence_end_date: null, recurrence_end_count: 3 }),
    }));
  });

  it("clears an end date when switching to never", async () => {
    const create = mockCreate();
    render(<AddTaskPage />);
    enterDueDate();
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: "DAILY" } });
    fireEvent.change(screen.getByLabelText("ينتهي"), { target: { value: "DATE" } });
    selectDate(/تاريخ انتهاء التكرار/, "2026-12-31");
    fireEvent.change(screen.getByLabelText("ينتهي"), { target: { value: "NEVER" } });
    submit();

    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledWith({
      data: expect.objectContaining({ recurrence_end_date: null, recurrence_end_count: null }),
    }));
  });

  it("clears an end count when switching to a date", async () => {
    const create = mockCreate();
    render(<AddTaskPage />);
    enterDueDate();
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: "WEEKLY" } });
    fireEvent.change(screen.getByLabelText("ينتهي"), { target: { value: "COUNT" } });
    fireEvent.change(screen.getByLabelText(/عدد المرات/), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("ينتهي"), { target: { value: "DATE" } });
    selectDate(/تاريخ انتهاء التكرار/, "2026-12-31");
    submit();

    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledWith({
      data: expect.objectContaining({ recurrence_end_date: "2026-12-31", recurrence_end_count: null }),
    }));
  });

  it("clears all recurrence state when switching to no recurrence", async () => {
    const create = mockCreate();
    render(<AddTaskPage />);
    enterDueDate();
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: "CUSTOM" } });
    fireEvent.change(screen.getByLabelText(/الفاصل/), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText("ينتهي"), { target: { value: "COUNT" } });
    fireEvent.change(screen.getByLabelText(/عدد المرات/), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: "NONE" } });
    expect(screen.queryByLabelText(/الفاصل/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("ينتهي")).not.toBeInTheDocument();
    submit();

    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recurrence_interval: null,
        recurrence_unit: null,
        recurrence_end_date: null,
        recurrence_end_count: null,
      }),
    }));
  });

  it.each(["0", "-1", "1.5", ""])("rejects invalid custom interval %s", (value) => {
    const create = mockCreate();
    render(<AddTaskPage />);
    enterDueDate();
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: "CUSTOM" } });
    fireEvent.change(screen.getByLabelText(/الفاصل/), { target: { value } });
    submit();
    expect(screen.getByText("أدخل عدداً صحيحاً أكبر من صفر.")).toBeInTheDocument();
    expect(create.mutateAsync).not.toHaveBeenCalled();
  });

  it.each(["0", "-2", "2.5", ""])("rejects invalid occurrence count %s", (value) => {
    const create = mockCreate();
    render(<AddTaskPage />);
    enterDueDate();
    fireEvent.change(screen.getByLabelText("التكرار"), { target: { value: "DAILY" } });
    fireEvent.change(screen.getByLabelText("ينتهي"), { target: { value: "COUNT" } });
    fireEvent.change(screen.getByLabelText(/عدد المرات/), { target: { value } });
    submit();
    expect(screen.getByText("أدخل عدداً صحيحاً أكبر من صفر.")).toBeInTheDocument();
    expect(create.mutateAsync).not.toHaveBeenCalled();
  });

  it("shows a success state after creation", async () => {
    render(<AddTaskPage />);
    enterDueDate();
    submit();
    expect(await screen.findByText("تم إنشاء المهمة.")).toBeInTheDocument();
  });

  it("displays a mutation error without false success", async () => {
    const create = mockCreate();
    create.mutateAsync.mockRejectedValue(makeApiError("بيانات غير صالحة"));
    render(<AddTaskPage />);
    enterDueDate();
    submit();
    expect(await screen.findByText("بيانات غير صالحة")).toBeInTheDocument();
    expect(screen.queryByText("تم إنشاء المهمة")).not.toBeInTheDocument();
  });
});
