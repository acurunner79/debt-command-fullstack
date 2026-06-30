import type { Bill } from "./bill";

export type PaymentStatus =
  | "UNPAID"
  | "PAID"
  | "PARTIAL"
  | "OVERDUE"
  | "SKIPPED";

export type Payment = {
  id: string;
  userId: string;
  billId: string;
  month: number;
  year: number;
  amountPaid: string;
  paymentDate: string | null;
  status: PaymentStatus;
  notes: string | null;
  bill: Bill;
  createdAt: string;
  updatedAt: string;
};

export type PaymentsResponse = {
  payments: Payment[];
};

export type PaymentResponse = {
  payment: Payment;
};

export type CreatePaymentInput = {
  billId: string;
  month: number;
  year: number;
  amountPaid: number;
  paymentDate?: string;
  status?: PaymentStatus;
  notes?: string;
};