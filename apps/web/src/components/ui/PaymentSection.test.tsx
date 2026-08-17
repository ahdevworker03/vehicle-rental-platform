import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PaymentSection } from "./PaymentSection";
import { ApiError, type PaymentResponse } from "@workspace/api-client-react";

vi.mock("@/features/payments/hooks", () => ({
  useRentalPayments: vi.fn(),
  usePaymentMutations: vi.fn(),
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

import { useRentalPayments, usePaymentMutations } from "@/features/payments/hooks";
import { useAuth } from "@/providers/AuthProvider";

const mockedUseRentalPayments = vi.mocked(useRentalPayments);
const mockedUsePaymentMutations = vi.mocked(usePaymentMutations);
const mockedUseAuth = vi.mocked(useAuth);

function makePayment(overrides: Partial<PaymentResponse>): PaymentResponse {
  return {
    id: "p1",
    rentalId: "r1",
    amount: 50,
    paymentDate: "2026-08-15T12:00:00Z",
    method: "CASH",
    createdAt: "2026-08-15T12:00:00Z",
    updatedAt: "2026-08-15T12:00:00Z",
    ...overrides,
  };
}

function mockOwner() {
  mockedUseAuth.mockReturnValue({
    user: { role: "OWNER" },
  } as ReturnType<typeof useAuth>);
}

function mockEmployee() {
  mockedUseAuth.mockReturnValue({
    user: { role: "EMPLOYEE" },
  } as ReturnType<typeof useAuth>);
}

function makeApiError(message: string): ApiError {
  const response = new Response(null, {
    status: 400,
    statusText: "Bad Request",
  });
  return new ApiError(response, { error: { code: "ERROR", message } }, { method: "GET", url: "/api/rentals/r1/payments" });
}

function mockData(payments: PaymentResponse[], outstandingBalance: number) {
  mockedUseRentalPayments.mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: { payments, outstandingBalance },
  } as unknown as ReturnType<typeof useRentalPayments>);
}

function mockCreate() {
  const create = {
    isPending: false,
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  };
  mockedUsePaymentMutations.mockReturnValue({
    create,
  } as unknown as ReturnType<typeof usePaymentMutations>);
  return create;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockOwner();
  mockCreate();
});

describe("PaymentSection", () => {
  it("shows a loading spinner while payments are loading", () => {
    mockedUseRentalPayments.mockReturnValue({
      isLoading: true,
      isError: false,
      error: null,
      data: { payments: [], outstandingBalance: 0 },
    } as unknown as ReturnType<typeof useRentalPayments>);

    const { container } = render(<PaymentSection rentalId="r1" />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("shows an error message when loading fails", () => {
    mockedUseRentalPayments.mockReturnValue({
      isLoading: false,
      isError: true,
      error: makeApiError("فشل تحميل المدفوعات"),
      data: { payments: [], outstandingBalance: 0 },
    } as unknown as ReturnType<typeof useRentalPayments>);

    render(<PaymentSection rentalId="r1" />);
    expect(screen.getByText("فشل تحميل المدفوعات")).toBeInTheDocument();
  });

  it("shows the outstanding balance and an empty state when there are no payments", () => {
    mockData([], 120);

    render(<PaymentSection rentalId="r1" />);

    expect(screen.getByText("الرصيد المتبقي")).toBeInTheDocument();
    expect(screen.getByText("$120")).toBeInTheDocument();
    expect(screen.getByText("لا توجد مدفوعات مسجّلة بعد")).toBeInTheDocument();
  });

  it("renders payment history entries with amount, date, and method label", () => {
    mockData(
      [
        makePayment({ id: "p1", amount: 50, method: "CASH", paymentDate: "2026-08-15T12:00:00Z" }),
        makePayment({ id: "p2", amount: 70, method: "TRANSFER", paymentDate: "2026-08-20T12:00:00Z" }),
      ],
      0,
    );

    render(<PaymentSection rentalId="r1" />);

    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("$70")).toBeInTheDocument();
    expect(screen.getAllByText("نقداً")).toHaveLength(1);
    expect(screen.getByText("تحويل بنكي")).toBeInTheDocument();
  });

  it("records a payment and shows a success message", async () => {
    const create = mockCreate();
    mockData([], 120);

    render(<PaymentSection rentalId="r1" />);

    fireEvent.click(screen.getByText("تسجيل أول دفعة"));

    fireEvent.change(screen.getByLabelText(/المبلغ/), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(/تاريخ الدفع/), { target: { value: "2026-08-15" } });
    fireEvent.change(screen.getByLabelText(/طريقة الدفع/), { target: { value: "CASH" } });

    fireEvent.click(screen.getByText("تسجيل الدفع"));

    await waitFor(() => {
      expect(create.mutateAsync).toHaveBeenCalledWith({
        rentalId: "r1",
        data: {
          amount: 50,
          payment_date: "2026-08-15T12:00:00.000Z",
          method: "CASH",
        },
      });
    });

    expect(screen.getByText("تم تسجيل الدفع بنجاح")).toBeInTheDocument();
  });

  it("validates required fields before submitting", async () => {
    const create = mockCreate();
    mockData([], 120);

    render(<PaymentSection rentalId="r1" />);

    fireEvent.click(screen.getByText("تسجيل أول دفعة"));
    fireEvent.click(screen.getByText("تسجيل الدفع"));

    expect(await screen.findByText("أدخل مبلغاً صحيحاً")).toBeInTheDocument();
    expect(screen.getByText("أدخل تاريخ الدفع")).toBeInTheDocument();
    expect(screen.getByText("اختر طريقة الدفع")).toBeInTheDocument();
    expect(create.mutateAsync).not.toHaveBeenCalled();
  });

  it("rejects a zero or negative amount", async () => {
    mockData([], 120);
    render(<PaymentSection rentalId="r1" />);

    fireEvent.click(screen.getByText("تسجيل أول دفعة"));
    fireEvent.change(screen.getByLabelText(/المبلغ/), { target: { value: "0" } });
    fireEvent.click(screen.getByText("تسجيل الدفع"));

    expect(await screen.findByText("أدخل مبلغاً أكبر من صفر")).toBeInTheDocument();
  });

  it("shows the backend error message when a payment fails", async () => {
    const create = mockCreate();
    create.mutateAsync.mockRejectedValue(makeApiError("الرصيد غير كافٍ"));
    mockData([], 120);

    render(<PaymentSection rentalId="r1" />);

    fireEvent.click(screen.getByText("تسجيل أول دفعة"));
    fireEvent.change(screen.getByLabelText(/المبلغ/), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(/تاريخ الدفع/), { target: { value: "2026-08-15" } });
    fireEvent.change(screen.getByLabelText(/طريقة الدفع/), { target: { value: "CASH" } });
    fireEvent.click(screen.getByText("تسجيل الدفع"));

    expect(await screen.findByText("الرصيد غير كافٍ")).toBeInTheDocument();
  });

  it("hides the record-payment button for non-owner users", () => {
    mockEmployee();
    mockData([], 120);

    render(<PaymentSection rentalId="r1" />);

    expect(screen.queryByText("تسجيل دفع")).not.toBeInTheDocument();
    expect(screen.queryByText("تسجيل أول دفعة")).not.toBeInTheDocument();
  });
});
