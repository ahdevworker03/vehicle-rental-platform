import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MaintenanceScheduleResponse, VehicleResponse } from "@workspace/api-client-react";
import { MaintenanceScheduleManager } from "./MaintenanceScheduleManager";

vi.mock("@/features/maintenance/hooks", () => ({ useMaintenanceScheduleMutations: vi.fn() }));
import { useMaintenanceScheduleMutations } from "@/features/maintenance/hooks";
const mockedMutations = vi.mocked(useMaintenanceScheduleMutations);
const vehicle = { id: "v1", make: "Toyota", model: "Camry", plateNumber: "ABC-123" } as VehicleResponse;
const schedule = { id: "s1", vehicleId: "v1", maintenanceType: "PREVENTIVE_SERVICE", scheduleType: "DATE", dateIntervalDays: 30, nextDueDate: "2026-09-01", mileageInterval: null, nextDueMileage: null, isActive: true, createdAt: "", updatedAt: "" } as MaintenanceScheduleResponse;

function selectDate(label: string, value: string) {
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

describe("MaintenanceScheduleManager", () => {
  const create = { mutateAsync: vi.fn(), isPending: false }; const update = { mutateAsync: vi.fn(), isPending: false }; const remove = { mutateAsync: vi.fn(), isPending: false };
  beforeEach(() => { vi.clearAllMocks(); create.mutateAsync.mockResolvedValue(undefined); update.mutateAsync.mockResolvedValue(undefined); remove.mutateAsync.mockResolvedValue(undefined); mockedMutations.mockReturnValue({ create, update, remove } as ReturnType<typeof useMaintenanceScheduleMutations>); });
  it("shows schedule actions only to owners", () => { render(<MaintenanceScheduleManager schedules={[schedule]} vehicles={[vehicle]} isOwner={false} />); expect(screen.queryByText("إضافة جدول صيانة")).not.toBeInTheDocument(); expect(screen.getByText(/مفعّل/)).toBeInTheDocument(); });
  it("creates a DATE schedule with date fields only", async () => { render(<MaintenanceScheduleManager schedules={[]} vehicles={[vehicle]} isOwner />); fireEvent.click(screen.getByText("إضافة جدول صيانة")); fireEvent.change(screen.getByLabelText("المركبة"), { target: { value: "v1" } }); fireEvent.change(screen.getByLabelText("فاصل الأيام"), { target: { value: "30" } }); selectDate("تاريخ الاستحقاق", "2026-09-01"); expect(screen.queryByLabelText("فاصل العداد")).not.toBeInTheDocument(); fireEvent.click(screen.getByText("حفظ الجدول")); await waitFor(() => expect(create.mutateAsync).toHaveBeenCalled()); });
  it("switches basis fields, edits, pauses, and confirms deletion", async () => { render(<MaintenanceScheduleManager schedules={[schedule]} vehicles={[vehicle]} isOwner />); fireEvent.click(screen.getByText("تعديل")); fireEvent.change(screen.getByLabelText("أساس الجدول"), { target: { value: "MILEAGE" } }); expect(screen.getByLabelText("فاصل العداد")).toBeInTheDocument(); expect(screen.queryByLabelText("فاصل الأيام")).not.toBeInTheDocument(); fireEvent.click(screen.getByText("إيقاف")); await waitFor(() => expect(update.mutateAsync).toHaveBeenCalledWith({ id: "s1", data: { is_active: false } })); fireEvent.click(screen.getByText("حذف")); fireEvent.click(screen.getByText("تأكيد الحذف")); await waitFor(() => expect(remove.mutateAsync).toHaveBeenCalledWith({ id: "s1" })); });
});
