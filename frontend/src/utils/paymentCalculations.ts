import type { Payment } from "../types/payment";

export type MonthlyPaymentSummary = {
  key: string;
  month: number;
  year: number;
  label: string;
  totalPaid: number;
  paymentCount: number;
};

export function getMonthYearLabel(month: number, year: number) {
  const date = new Date(year, month - 1, 1);

  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

export function calculateTotalPaid(payments: Payment[]) {
  return payments.reduce((total, payment) => {
    return total + Number(payment.amountPaid || 0);
  }, 0);
}

export function getMonthlyPaymentSummaries(
  payments: Payment[]
): MonthlyPaymentSummary[] {
  const summaries = new Map<string, MonthlyPaymentSummary>();

  payments.forEach((payment) => {
    const key = `${payment.year}-${String(payment.month).padStart(2, "0")}`;
    const existingSummary = summaries.get(key);

    if (existingSummary) {
      existingSummary.totalPaid += Number(payment.amountPaid || 0);
      existingSummary.paymentCount += 1;
      return;
    }

    summaries.set(key, {
      key,
      month: payment.month,
      year: payment.year,
      label: getMonthYearLabel(payment.month, payment.year),
      totalPaid: Number(payment.amountPaid || 0),
      paymentCount: 1,
    });
  });

  return [...summaries.values()].sort((first, second) => {
    return first.key.localeCompare(second.key);
  });
}

export function getRecentPayments(payments: Payment[], limit = 5) {
  return [...payments]
    .sort((first, second) => {
      const firstDate = first.paymentDate
        ? new Date(first.paymentDate).getTime()
        : 0;
      const secondDate = second.paymentDate
        ? new Date(second.paymentDate).getTime()
        : 0;

      return secondDate - firstDate;
    })
    .slice(0, limit);
}