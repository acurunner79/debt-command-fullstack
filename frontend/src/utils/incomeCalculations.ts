import type { IncomeFrequency, IncomeSource } from "../types/income";

export function calculateMonthlyIncomeAmount(
  amount: number,
  frequency: IncomeFrequency
) {
  switch (frequency) {
    case "WEEKLY":
      return (amount * 52) / 12;
    case "BIWEEKLY":
      return (amount * 26) / 12;
    case "SEMIMONTHLY":
      return amount * 2;
    case "MONTHLY":
      return amount;
    case "YEARLY":
      return amount / 12;
    case "ONETIME":
      return amount;
    default:
      return amount;
  }
}

export function calculateTotalMonthlyIncome(incomeSources: IncomeSource[]) {
  return incomeSources.reduce((total, source) => {
    return (
      total +
      calculateMonthlyIncomeAmount(Number(source.amount), source.frequency)
    );
  }, 0);
}