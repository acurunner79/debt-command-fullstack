import type { BillType } from "./bill";
import type { PayoffStrategy } from "./payoff";

export type PayoffScenario = {
  id: string;
  userId: string;
  name: string;
  strategy: PayoffStrategy;
  extraPayment: string;
  includedDebtTypes: string;
  createdAt: string;
  updatedAt: string;
};

export type ParsedPayoffScenario = Omit<
  PayoffScenario,
  "strategy" | "extraPayment" | "includedDebtTypes"
> & {
  strategy: PayoffStrategy;
  extraPayment: number;
  includedDebtTypes: BillType[];
};

export type PayoffScenariosResponse = {
  scenarios: PayoffScenario[];
};

export type PayoffScenarioResponse = {
  scenario: PayoffScenario;
};

export type CreatePayoffScenarioInput = {
  name: string;
  strategy: PayoffStrategy;
  extraPayment: number;
  includedDebtTypes: BillType[];
};