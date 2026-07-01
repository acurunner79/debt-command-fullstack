import { apiRequest } from "./api";
import type {
  CreatePayoffScenarioInput,
  PayoffScenarioResponse,
  PayoffScenariosResponse,
} from "../types/payoffScenario";

export function getPayoffScenarios() {
  return apiRequest<PayoffScenariosResponse>("/payoff-scenarios");
}

export function createPayoffScenario(input: CreatePayoffScenarioInput) {
  return apiRequest<PayoffScenarioResponse>("/payoff-scenarios", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deletePayoffScenario(id: string) {
  return apiRequest<PayoffScenarioResponse>(`/payoff-scenarios/${id}`, {
    method: "DELETE",
  });
}

export function setDefaultPayoffScenario(id: string) {
  return apiRequest<PayoffScenarioResponse>(`/payoff-scenarios/${id}/default`, {
    method: "PATCH",
  });
}