import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CustomerResponse } from "@workspace/api-client-react";
import { CustomersDataList } from "./CustomersDataList";

const customer = {
  id: "customer-1",
  firstName: "أحمد",
  lastName: "حسن",
  phone: "+9613012345",
  address: "بيروت",
  nationalId: "123456789",
  licenseNumber: "DL-9988",
  licenseExpiryDate: "2027-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
} as CustomerResponse;

describe("CustomersDataList", () => {
  it("keeps Arabic identity and LTR renter identifiers readable", () => {
    render(<CustomersDataList customers={[customer]} onOpen={vi.fn()} />);

    expect(screen.getAllByText("أحمد حسن").length).toBeGreaterThan(0);
    expect(screen.getAllByText("123456789").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DL-9988").length).toBeGreaterThan(0);
  });

  it("keeps long mixed-direction identity and identifier values constrained", () => {
    const longCustomer = {
      ...customer,
      id: "customer-2",
      firstName: "شركة النخبة الدولية لتأجير المركبات",
      lastName: "Al Noor Fleet Management",
      phone: "+961701234567890",
      nationalId: "12345678901234567890",
      licenseNumber: "LB-DRIVER-LICENSE-2026-998877",
    };
    render(<CustomersDataList customers={[longCustomer]} onOpen={vi.fn()} />);

    const names = screen.getAllByText(
      "شركة النخبة الدولية لتأجير المركبات Al Noor Fleet Management",
    );
    expect(names[0].className).toContain(
      "truncate text-sm font-medium text-foreground",
    );
    expect(screen.getAllByText("+961701234567890")[0].className).toContain(
      "number-ltr mt-0.5 block truncate text-right",
    );
    expect(screen.getAllByText("12345678901234567890")[0].className).toContain(
      "number-ltr block whitespace-nowrap text-end text-sm font-medium",
    );
    expect(
      screen.getAllByText("LB-DRIVER-LICENSE-2026-998877")[0].className,
    ).toContain(
      "number-ltr block whitespace-nowrap text-end text-sm font-medium",
    );
  });

  it("opens the selected customer", () => {
    const onOpen = vi.fn();
    render(<CustomersDataList customers={[customer]} onOpen={onOpen} />);

    fireEvent.click(screen.getAllByRole("button", { name: "عرض التفاصيل" })[0]);
    expect(onOpen).toHaveBeenCalledWith("customer-1");
  });
});
