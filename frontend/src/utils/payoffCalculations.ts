import type { Bill } from "../types/bill";
import type { PayoffDebt, PayoffPlanItem, PayoffStrategy } from "../types/payoff";

function toPayoffDebt(bill: Bill): PayoffDebt | null {
  const balanceAmount = Number(bill.balance || 0);
  const minimumPaymentAmount = Number(bill.minimumPayment || 0);
  const interestRateAmount = Number(bill.interestRate || 0);

  if (balanceAmount <= 0) {
    return null;
  }

  return {
    ...bill,
    balanceAmount,
    minimumPaymentAmount,
    interestRateAmount,
  };
}

export function getPayoffDebts(bills: Bill[]) {
  return bills
    .map(toPayoffDebt)
    .filter((bill): bill is PayoffDebt => bill !== null);
}

export function calculatePayoffPlan(
  bills: Bill[],
  strategy: PayoffStrategy
): PayoffPlanItem[] {
  const payoffDebts = getPayoffDebts(bills);

  const sortedDebts = [...payoffDebts].sort((first, second) => {
    if (strategy === "SNOWBALL") {
      return first.balanceAmount - second.balanceAmount;
    }

    return second.interestRateAmount - first.interestRateAmount;
  });

  return sortedDebts.map((bill, index) => {
    const strategyReason =
      strategy === "SNOWBALL"
        ? `Smallest balance priority: ${bill.balanceAmount}`
        : `Highest interest priority: ${bill.interestRateAmount}%`;

    return {
      billId: bill.id,
      name: bill.name,
      type: bill.type,
      balance: bill.balanceAmount,
      minimumPayment: bill.minimumPaymentAmount,
      interestRate: bill.interestRateAmount,
      priority: index + 1,
      strategyReason,
    };
  });
}

export function calculateTotalDebtMinimums(bills: Bill[]) {
  return getPayoffDebts(bills).reduce((total, bill) => {
    return total + bill.minimumPaymentAmount;
  }, 0);
}