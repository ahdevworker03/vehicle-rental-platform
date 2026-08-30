import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RentalResponse } from "@workspace/api-client-react";

vi.mock("wouter", () => ({
  useLocation: () => ["/rentals/rental-1", vi.fn()],
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("@/features/contracts", () => ({
  ContractSection: () => <section>العقد والمستندات</section>,
}));
vi.mock("@/features/payments", () => ({
  PaymentSection: () => <section>المدفوعات</section>,
}));
vi.mock("@/components/layout/PageHeader", () => ({
  PageHeader: ({
    title,
    action,
  }: {
    title: string;
    action?: React.ReactNode;
  }) => (
    <header>
      <h1>{title}</h1>
      {action}
    </header>
  ),
}));
vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({ user: { role: "OWNER" } }),
}));

const rental: RentalResponse = {
  id: "rental-12345678",
  customerId: "customer-1",
  vehicleId: "vehicle-1",
  pickupDate: "2026-08-01T09:00:00.000Z",
  expectedReturnDate: "2026-08-05T09:00:00.000Z",
  actualPickupDate: "2026-08-01T09:15:00.000Z",
  actualReturnDate: null,
  dailyRate: 100,
  totalAmount: 400,
  depositAmount: 50,
  status: "RESERVED",
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: "2026-08-01T09:00:00.000Z",
};

vi.mock("@workspace/api-client-react", () => ({
  getGetRentalQueryKey: vi.fn(() => []),
  getListCustomersQueryKey: vi.fn(() => []),
  getListRentalsQueryKey: vi.fn(() => []),
  getListVehiclesQueryKey: vi.fn(() => []),
  useGetRental: () => ({
    isLoading: false,
    isError: false,
    data: { data: rental },
  }),
  useGetCustomer: () => ({
    data: {
      data: {
        id: "customer-1",
        firstName: "أحمد",
        lastName: "حسن",
        phone: "+9613012345",
        nationalId: "123456789",
        licenseNumber: "LIC-100",
        licenseExpiryDate: "2028-08-01T00:00:00.000Z",
        address: "بيروت",
        email: "not-a-customer-field@example.com",
      },
    },
  }),
  useGetVehicle: () => ({
    data: {
      data: {
        id: "vehicle-1",
        make: "Toyota",
        model: "Camry",
        plateNumber: "ABC-123",
        status: "RESERVED",
        currentMileage: 32100,
        year: 2024,
        color: "أبيض",
      },
    },
  }),
  usePickupRental: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useReturnRental: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useExtendRental: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useCancelRental: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

import RentalDetailPage from "./RentalDetailPage";

describe("RentalDetailPage", () => {
  it("shows the rental, customer, and vehicle details without adding customer email", () => {
    render(<RentalDetailPage params={{ id: rental.id }} />);

    expect(
      screen.getByRole("heading", { name: "تفاصيل الإيجار" }),
    ).toBeInTheDocument();
    expect(screen.getByText("#rental-1")).toBeInTheDocument();
    expect(screen.getAllByText("أحمد حسن")).toHaveLength(2);
    expect(screen.getAllByText("Toyota")).toHaveLength(1);
    expect(screen.getAllByText("Camry")).toHaveLength(1);
    expect(screen.getByText("رقم الهوية")).toBeInTheDocument();
    expect(screen.getByText("سنة الصنع")).toBeInTheDocument();
    expect(screen.getByText("الاستلام الفعلي")).toBeInTheDocument();
    expect(
      screen.queryByText("not-a-customer-field@example.com"),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /تسجيل الاستلام/ }),
    ).toHaveLength(1);
  });
});
