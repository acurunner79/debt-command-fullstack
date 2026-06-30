import { apiRequest } from "./api";
import type {
  BillResponse,
  BillsResponse,
  CreateBillInput,
  UpdateBillInput,
} from "../types/bill";

export function getBills() {
  return apiRequest<BillsResponse>("/bills");
}

export function createBill(input: CreateBillInput) {
  return apiRequest<BillResponse>("/bills", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateBill(id: string, input: UpdateBillInput) {
  return apiRequest<BillResponse>(`/bills/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function archiveBill(id: string) {
  return apiRequest<BillResponse>(`/bills/${id}`, {
    method: "DELETE",
  });
}

export function updateBillBalance(id: string, balance: number) {
  return apiRequest<BillResponse>(`/bills/${id}/balance`, {
    method: "PATCH",
    body: JSON.stringify({ balance }),
  });
}