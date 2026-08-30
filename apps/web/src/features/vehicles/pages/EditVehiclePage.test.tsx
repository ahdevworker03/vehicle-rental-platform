import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EditVehiclePage from "./EditVehiclePage";

const setLocation = vi.fn();
const update = {
  isPending: false,
  mutateAsync: vi.fn().mockResolvedValue(undefined),
};

vi.mock("wouter", () => ({
  useLocation: () => ["/vehicles/vehicle-1/edit", setLocation],
}));

vi.mock("@/features/vehicles/api-hooks", () => ({
  useVehicleRecord: () => ({
    data: {
      data: {
        id: "vehicle-1",
        make: "Toyota",
        model: "Corolla",
        plateNumber: "TEST-8237",
        year: 2024,
        color: "أبيض",
        notes: "ملاحظة حالية",
        transmission: "AUTOMATIC",
        fuelType: "PETROL",
        seats: 5,
        currentMileage: 12000,
        status: "AVAILABLE",
        createdAt: "2026-08-30T00:00:00.000Z",
        updatedAt: "2026-08-30T00:00:00.000Z",
      },
    },
    isLoading: false,
    isError: false,
  }),
  useVehicleMutations: () => ({ update }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  update.mutateAsync.mockResolvedValue(undefined);
});

describe("EditVehiclePage", () => {
  it("loads existing notes and submits null when they are cleared", async () => {
    render(<EditVehiclePage params={{ id: "vehicle-1" }} />);

    const notes = await screen.findByLabelText("ملاحظات");
    expect((notes as HTMLTextAreaElement).value).toBe("ملاحظة حالية");

    fireEvent.change(notes, { target: { value: "   " } });
    fireEvent.click(screen.getByText("حفظ التعديلات"));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        id: "vehicle-1",
        data: expect.objectContaining({ notes: null }),
      });
    });
  });
});
