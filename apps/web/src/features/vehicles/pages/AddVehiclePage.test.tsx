import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddVehiclePage from "./AddVehiclePage";

const setLocation = vi.fn();
const create = {
  isPending: false,
  mutateAsync: vi.fn().mockResolvedValue(undefined),
};

vi.mock("wouter", () => ({
  useLocation: () => ["/vehicles/add", setLocation],
}));

vi.mock("@/features/vehicles/api-hooks", () => ({
  useVehicleMutations: () => ({ create }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  create.mutateAsync.mockResolvedValue(undefined);
});

describe("AddVehiclePage", () => {
  it("submits optional notes without legacy identifier fields", async () => {
    render(<AddVehiclePage />);

    expect(screen.queryByText("معرّفات إضافية")).toBeNull();
    expect(screen.queryByLabelText(/VIN/)).toBeNull();
    expect(screen.queryByLabelText(/رقم المحرك/)).toBeNull();

    fireEvent.change(screen.getByLabelText(/الشركة المصنعة/), { target: { value: "Toyota" } });
    fireEvent.change(screen.getByLabelText(/الطراز/), { target: { value: "Corolla" } });
    fireEvent.change(screen.getByLabelText(/رقم اللوحة/), { target: { value: "TEST-8237" } });
    fireEvent.change(screen.getByLabelText(/سنة الصنع/), { target: { value: "2024" } });
    fireEvent.change(screen.getByLabelText(/اللون/), { target: { value: "أبيض" } });
    fireEvent.change(screen.getByLabelText(/عدد المقاعد/), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText(/العداد الحالي/), { target: { value: "12000" } });
    fireEvent.change(screen.getByLabelText("ملاحظات"), { target: { value: "  فحص الإطارات دورياً  " } });
    fireEvent.click(screen.getByText("حفظ المركبة"));

    await waitFor(() => {
      expect(create.mutateAsync).toHaveBeenCalledWith({
        data: {
          make: "Toyota",
          model: "Corolla",
          plate_number: "TEST-8237",
          year: 2024,
          color: "أبيض",
          notes: "فحص الإطارات دورياً",
          transmission: "AUTOMATIC",
          fuel_type: "PETROL",
          seats: 5,
          current_mileage: 12000,
          status: "AVAILABLE",
        },
      });
    });
  });
});
