import type { Bill } from "./bill";

export type PayoffStrategy = "SNOWBALL" | "AVALANCHE";

export type PayoffDebt = Bill & {
  balanceAmount: number;
  minimumPaymentAmount: number;
  interestRateAmount: number;
};

export type PayoffPlanItem = {
  billId: string;
  name: string;
  type: string;
  balance: number;
  minimumPayment: number;
  interestRate: number;
  priority: number;
  strategyReason: string;
};

export type PayoffTimelineItem = PayoffPlanItem & {
  startingBalance: number;
  monthlyPaymentApplied: number;
  estimatedMonths: number;
  estimatedPayoffDate: string;
  remainingDebtAfterPayoff: number;
};

export type PayoffTimelineSummary = {
  totalStartingDebt: number;
  totalMinimumPayments: number;
  extraMonthlyPayment: number;
  totalMonthlyPayoffAmount: number;
  estimatedTotalMonths: number;
  estimatedDebtFreeDate: string | null;
  timeline: PayoffTimelineItem[];
};