import { fireEvent, render, screen, within } from "@testing-library/react";
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
  it("groups the customer identity without duplicating the phone number", () => {
    render(<CustomersDataList customers={[customer]} onOpen={vi.fn()} />);

    const table = screen.getByRole("table");
    const identityCell = table.querySelector<HTMLTableCellElement>("tbody td")!;
    const identity = within(identityCell).getByText("أحمد حسن");

    expect(identityCell).not.toHaveTextContent(customer.phone);
    expect(identity.parentElement).toHaveClass("min-w-0", "text-start");
    expect(identity.parentElement).not.toHaveClass("flex-1");
    expect(identity).toHaveClass("break-words");
    const identityWrapper = identityCell.querySelector("div");
    expect(identityWrapper).toHaveClass(
      "flex",
      "min-w-0",
      "items-start",
      "gap-3",
    );
    expect(identityWrapper).not.toHaveClass("xl:min-w-[18rem]");
    expect(identityCell.querySelector("svg")?.parentElement).toHaveClass(
      "size-9",
      "shrink-0",
    );
  });

  it("keeps long mixed-direction names wrapping and identifiers LTR-isolated", () => {
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
    expect(names[0]).toHaveClass("break-words", "text-sm", "font-medium");

    const table = screen.getByRole("table");
    for (const value of [
      longCustomer.phone,
      longCustomer.nationalId,
      longCustomer.licenseNumber,
    ]) {
      const identifier = within(table).getByText(value);
      expect(identifier).toHaveAttribute("dir", "ltr");
      expect(identifier).toHaveClass("identifier-ltr", "whitespace-nowrap");
    }
  });

  it("preserves desktop customer table widths and actions", () => {
    render(<CustomersDataList customers={[customer]} onOpen={vi.fn()} />);

    const table = screen.getByRole("table");
    expect(table).toHaveClass("min-w-[62rem]", "table-fixed");
    expect(within(table).getByRole("columnheader", { name: "العميل" })).toHaveClass("w-[20rem]");
    expect(within(table).getByRole("columnheader", { name: "رقم الهاتف" })).toHaveClass("w-[10rem]", "text-start");
    expect(within(table).getByRole("columnheader", { name: "رقم الهوية" })).toHaveClass("w-[12rem]", "text-start");
    expect(within(table).getByRole("columnheader", { name: "رقم الرخصة" })).toHaveClass("w-[12rem]", "text-start");
    expect(within(table).getByRole("columnheader", { name: "الإجراء" })).toHaveClass("w-[10rem]");
  });

  it("opens the selected customer", () => {
    const onOpen = vi.fn();
    render(<CustomersDataList customers={[customer]} onOpen={onOpen} />);

    fireEvent.click(screen.getAllByRole("button", { name: "عرض التفاصيل" })[0]);
    expect(onOpen).toHaveBeenCalledWith("customer-1");
  });
});
