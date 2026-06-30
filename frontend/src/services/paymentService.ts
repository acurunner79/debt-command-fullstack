import { apiRequest } from "./api";
import type {
  CreatePaymentInput,
  PaymentResponse,
  PaymentsResponse,
} from "../types/payment";

export function getPayments() {
  return apiRequest<PaymentsResponse>("/payments");
}

export function createPayment(input: CreatePaymentInput) {
  return apiRequest<PaymentResponse>("/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deletePayment(id: string) {
  return apiRequest<PaymentResponse>(`/payments/${id}`, {
    method: "DELETE",
  });
}