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

    expect(
      screen.getAllByLabelText("جارٍ تحميل حالة الدفع").length,
    ).toBeGreaterThan(0);
  });

  it("shows the backend-provided outstanding balance", () => {
    render(<RentalsDataList items={[item(125)]} onOpen={vi.fn()} />);

    expect(screen.getAllByText("المتبقي:").length).toBeGreaterThan(0);
    expect(screen.getAllByText("USD 125").length).toBeGreaterThan(0);
    expect(screen.queryByText(/الرصيد المتبقي USD 125/)).toBeNull();
  });

  it("keeps long customer and vehicle identities aligned with their secondary values", () => {
    const longItem = {
      ...item(200),
      customerName: "شركة النخبة الدولية لتأجير المركبات والخدمات اللوجستية",
      customerPhone: "+961701234567890",
      vehicleName:
        "Mercedes-Benz Sprinter Executive Passenger Van Long Wheelbase",
      vehiclePlate: "LB-RENTAL-FLEET-2026-998877",
    };
    render(<RentalsDataList items={[longItem]} onOpen={vi.fn()} />);

    expect(screen.getAllByText(longItem.customerName)[0].className).toContain(
      "truncate text-sm font-medium text-foreground",
    );
    expect(screen.getAllByText(longItem.customerPhone!)[0].className).toContain(
      "number-ltr mt-0.5 truncate text-right",
    );
    expect(screen.getAllByText(longItem.vehicleName)[0].className).toContain(
      "block truncate text-sm font-medium text-foreground",
    );
    expect(screen.getAllByText(longItem.vehiclePlate)[0].className).toContain(
      "number-ltr mt-0.5 block truncate text-right",
    );
  });

  it("keeps paid, partially paid, and outstanding rentals financially distinct", () => {
    const paid = {
      ...item(0),
      rental: { ...rental, id: "rental-paid", status: "RETURNED" as const },
    };
    const partial = {
      ...item(125),
      rental: { ...rental, id: "rental-partial", status: "RESERVED" as const },
    };
    const outstanding = {
      ...item(400),
      rental: {
        ...rental,
        id: "rental-outstanding",
        status: "ACTIVE" as const,
      },
    };
    render(
      <RentalsDataList items={[paid, partial, outstanding]} onOpen={vi.fn()} />,
    );

    expect(screen.getAllByText("مدفوع بالكامل").length).toBeGreaterThan(0);
    expect(screen.getAllByText("رصيد مستحق").length).toBeGreaterThan(0);
    expect(screen.getAllByText("USD 0").length).toBeGreaterThan(0);
    expect(screen.getAllByText("USD 125").length).toBeGreaterThan(0);
    expect(screen.getAllByText("USD 400").length).toBeGreaterThan(0);
  });
});
