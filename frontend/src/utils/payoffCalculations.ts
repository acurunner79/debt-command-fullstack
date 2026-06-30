import type { Bill } from "../types/bill";
import type {
  PayoffDebt,
  PayoffPlanItem,
  PayoffStrategy,
  PayoffTimelineItem,
  PayoffTimelineSummary,
} from "../types/payoff";

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

function addMonthsToDate(monthsToAdd: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsToAdd);

  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
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

export function calculateTotalStartingDebt(bills: Bill[]) {
  return getPayoffDebts(bills).reduce((total, bill) => {
    return total + bill.balanceAmount;
  }, 0);
}

export function calculatePayoffTimeline(
  bills: Bill[],
  strategy: PayoffStrategy,
  extraMonthlyPayment: number
): PayoffTimelineSummary {
  const payoffPlan = calculatePayoffPlan(bills, strategy);
  const totalStartingDebt = calculateTotalStartingDebt(bills);
  const totalMinimumPayments = calculateTotalDebtMinimums(bills);
  const totalMonthlyPayoffAmount = totalMinimumPayments + extraMonthlyPayment;

  let rolloverPayment = extraMonthlyPayment;
  let elapsedMonths = 0;
  let remainingDebt = totalStartingDebt;

  const timeline: PayoffTimelineItem[] = payoffPlan.map((item) => {
    const monthlyPaymentApplied = item.minimumPayment + rolloverPayment;
    const estimatedMonths =
      monthlyPaymentApplied > 0
        ? Math.max(1, Math.ceil(item.balance / monthlyPaymentApplied))
        : 0;

    elapsedMonths += estimatedMonths;
    remainingDebt -= item.balance;
    rolloverPayment += item.minimumPayment;

    return {
      ...item,
      startingBalance: item.balance,
      monthlyPaymentApplied,
      estimatedMonths,
      estimatedPayoffDate: addMonthsToDate(elapsedMonths),
      remainingDebtAfterPayoff: Math.max(0, remainingDebt),
    };
  });

  return {
    totalStartingDebt,
    totalMinimumPayments,
    extraMonthlyPayment,
    totalMonthlyPayoffAmount,
    estimatedTotalMonths: elapsedMonths,
    estimatedDebtFreeDate:
      timeline.length > 0 ? addMonthsToDate(elapsedMonths) : null,
    timeline,
  };
}