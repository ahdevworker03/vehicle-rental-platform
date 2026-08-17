import type { Decimal } from "@prisma/client/runtime/client";

export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "OTHER";

export interface PaymentRecord {
  id: string;
  organization_id: string;
  rental_id: string;
  amount: Decimal;
  payment_date: Date;
  method: PaymentMethod;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface PaymentResponse {
  id: string;
  rentalId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  amount: number;
  payment_date: Date;
  method: PaymentMethod;
}

export interface RentalPaymentsResult {
  payments: PaymentResponse[];
  outstandingBalance: number;
}
