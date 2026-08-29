import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RentalResponse } from "@workspace/api-client-react";
import { RentalsDataList, type RentalListItem } from "./RentalsDataList";

const rental = {
  id: "rental-1",
  customerId: "customer-1",
  vehicleId: "vehicle-1",
  pickupDate: "2026-08-01T09:00:00.000Z",
  expectedReturnDate: "2026-08-05T09:00:00.000Z",
  actualPickupDate: null,
  actualReturnDate: null,
  dailyRate: 100,
  totalAmount: 400,
  depositAmount: 50,
  status: "RESERVED",
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: "2026-08-01T09:00:00.000Z",
} as RentalResponse;

function item(outstandingBalance: number | null): RentalListItem {
  return {
    rental,
    customerName: "أحمد حسن",
    customerPhone: "+9613012345",
    vehicleName: "Toyota Camry",
    vehiclePlate: "ABC-123",
    outstandingBalance,
  };
}

describe("RentalsDataList", () => {
  it("does not present a financial value until the backend balance is available", () => {
    render(<RentalsDataList items={[item(null)]} onOpen={vi.fn()} />);

    expect(screen.getAllByLabelText("جارٍ تحميل حالة الدفع").length).toBeGreaterThan(0);
  });

  it("shows the backend-provided outstanding balance", () => {
    render(<RentalsDataList items={[item(125)]} onOpen={vi.fn()} />);

    expect(screen.getAllByText(/الرصيد المتبقي USD 125/).length).toBeGreaterThan(0);
  });
});
