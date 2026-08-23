import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { VehicleResponse } from "@workspace/api-client-react";
import { VehiclesDataList } from "./VehiclesDataList";

const vehicle = {
  id: "vehicle-1",
  make: "Toyota",
  model: "Yaris",
  plateNumber: "TEST-8237",
  year: 2024,
  transmission: "AUTOMATIC",
  fuelType: "PETROL",
  seats: 5,
  currentMileage: 50000,
  status: "AVAILABLE",
} as unknown as VehicleResponse;

describe("VehiclesDataList", () => {
  it("shows vehicle identity, approved status, and Western mileage formatting", () => {
    render(<VehiclesDataList vehicles={[vehicle]} onOpen={vi.fn()} />);

    expect(screen.getAllByText("Toyota Yaris").length).toBeGreaterThan(0);
    expect(screen.getAllByText("TEST-8237").length).toBeGreaterThan(0);
    expect(screen.getAllByText("متاحة").length).toBeGreaterThan(0);
    expect(screen.getAllByText("50,000 كم").length).toBeGreaterThan(0);
  });

  it("opens the matching vehicle from a row action", () => {
    const onOpen = vi.fn();
    render(<VehiclesDataList vehicles={[vehicle]} onOpen={onOpen} />);

    fireEvent.click(screen.getAllByRole("button", { name: "عرض التفاصيل" })[0]);
    expect(onOpen).toHaveBeenCalledWith("vehicle-1");
  });
});
