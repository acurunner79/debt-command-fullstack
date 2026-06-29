import { apiRequest } from "./api";
import type {
  CreateIncomeSourceInput,
  IncomeSourceResponse,
  IncomeSourcesResponse,
  UpdateIncomeSourceInput,
} from "../types/income";

export function getIncomeSources() {
  return apiRequest<IncomeSourcesResponse>("/income");
}

export function createIncomeSource(input: CreateIncomeSourceInput) {
  return apiRequest<IncomeSourceResponse>("/income", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateIncomeSource(id: string, input: UpdateIncomeSourceInput) {
  return apiRequest<IncomeSourceResponse>(`/income/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function archiveIncomeSource(id: string) {
  return apiRequest<IncomeSourceResponse>(`/income/${id}`, {
    method: "DELETE",
  });
}