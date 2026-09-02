import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NewRentalPage from "./NewRentalPage";

const setLocation = vi.fn();
const create = {
  isPending: false,
  mutateAsync: vi.fn().mockResolvedValue(undefined),
};

const customer = {
  id: "customer-1",
  firstName: "أحمد",
  lastName: "حسن",
  phone: "+9613012345",
};
const vehicle = {
  id: "vehicle-1",
  make: "Toyota",
  model: "Camry",
  plateNumber: "ABC-123",
  status: "AVAILABLE",
};

vi.mock("wouter", () => ({
  useLocation: () => ["/rentals/new", setLocation],
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@workspace/api-client-react", () => ({
  getCheckRentalAvailabilityQueryKey: vi.fn(),
  getListRentalsQueryKey: vi.fn(),
  getListVehiclesQueryKey: vi.fn(),
  useCheckRentalAvailability: () => ({ data: { data: { available: true } } }),
  useCreateRental: () => create,
  useListCustomers: () => ({ data: { data: [customer] }, isLoading: false }),
  useListVehicles: () => ({ data: { data: [vehicle] }, isLoading: false }),
}));

vi.mock("@/hooks/useTimeout", () => ({
  useTimeout: vi.fn(),
}));

function selectCustomerAndVehicle() {
  fireEvent.click(screen.getByText("Toyota Camry"));
  fireEvent.click(screen.getByText("أحمد حسن"));
}

function setValidPeriod() {
  selectDate(/تاريخ الاستلام/, "2026-09-01");
  fireEvent.change(screen.getByLabelText(/وقت الاستلام/), {
    target: { value: "10:30" },
  });
  selectDate(/تاريخ الإرجاع المتوقع/, "2026-09-03");
  fireEvent.change(screen.getByLabelText(/وقت الإرجاع المتوقع/), {
    target: { value: "16:45" },
  });
}

function selectDate(label: RegExp, date: string) {
  fireEvent.click(screen.getByLabelText(label));
  fireEvent.click(document.querySelector(`button[data-day="${date}"]`)!);
}

describe("NewRentalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    create.mutateAsync.mockResolvedValue(undefined);
  });

  it("selects customer and vehicle with their aligned secondary identifiers", () => {
    render(<NewRentalPage />);

    selectCustomerAndVehicle();

    expect(
      screen.getByText("العميل المحدد").parentElement?.textContent,
    ).toContain("أحمد حسن");
    expect(
      screen.getByText("المركبة المحددة").parentElement?.textContent,
    ).toContain("Toyota Camry");
    expect(screen.getAllByText("+9613012345")[0].className).toContain(
      "number-ltr mt-0.5 block truncate text-right",
    );
    expect(screen.getAllByText("ABC-123")[0].className).toContain(
      "number-ltr mt-0.5 block truncate text-right",
    );
  });

  it("shows all financial metrics in their default zero state", () => {
    render(<NewRentalPage />);

    expect(
      screen.getByText("إجمالي الإيجار").parentElement?.textContent,
    ).toContain("USD 0");
    expect(
      screen.getAllByText("الأجرة اليومية")[1].parentElement?.textContent,
    ).toContain("USD 0");
    expect(
      screen.getAllByText("مبلغ التأمين")[1].parentElement?.textContent,
    ).toContain("USD 0");
    expect(screen.getByText("المدة").parentElement?.textContent).toContain(
      "0 أيام",
    );
  });

  it("submits pickup and expected return dates with their selected times", async () => {
    render(<NewRentalPage />);
    selectCustomerAndVehicle();
    setValidPeriod();
    fireEvent.change(screen.getByLabelText(/الأجرة اليومية/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/مبلغ التأمين/), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "حفظ الإيجار" }));

    await waitFor(() => {
      expect(create.mutateAsync).toHaveBeenCalledWith({
        data: {
          customer_id: "customer-1",
          vehicle_id: "vehicle-1",
          pickup_date: "2026-09-01T10:30:00.000Z",
          expected_return_date: "2026-09-03T16:45:00.000Z",
          daily_rate: 100,
          total_amount: 300,
          deposit_amount: 50,
        },
      });
    });
  });

  it("rejects an expected return datetime before the pickup datetime", () => {
    render(<NewRentalPage />);
    selectCustomerAndVehicle();
    selectDate(/تاريخ الاستلام/, "2026-09-03");
    fireEvent.change(screen.getByLabelText(/وقت الاستلام/), {
      target: { value: "10:30" },
    });
    selectDate(/تاريخ الإرجاع المتوقع/, "2026-09-03");
    fireEvent.change(screen.getByLabelText(/وقت الإرجاع المتوقع/), {
      target: { value: "09:30" },
    });
    fireEvent.change(screen.getByLabelText(/الأجرة اليومية/), {
      target: { value: "100" },
    });
    const saveButton = screen.getByRole("button", { name: "حفظ الإيجار" });
    expect(saveButton.hasAttribute("disabled")).toBe(true);
    expect(create.mutateAsync).not.toHaveBeenCalled();
  });

  it("keeps the financial summary calculation visible", () => {
    render(<NewRentalPage />);
    setValidPeriod();
    fireEvent.change(screen.getByLabelText(/الأجرة اليومية/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/مبلغ التأمين/), {
      target: { value: "50" },
    });

    expect(
      screen.getByText("إجمالي الإيجار").parentElement?.textContent,
    ).toContain("USD 300");
    expect(
      screen.getAllByText("مبلغ التأمين")[1].parentElement?.textContent,
    ).toContain("USD 50");
    expect(screen.getByText("المدة").parentElement?.textContent).toContain(
      "3 أيام",
    );
  });
});
