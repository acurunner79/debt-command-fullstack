import type { Bill } from "../types/bill";
import type { Payment, PaymentStatus } from "../types/payment";

export type PaymentChecklistStatus = PaymentStatus | "UNPAID";

export type PaymentChecklistItem = {
  bill: Bill;
  payment: Payment | null;
  status: PaymentChecklistStatus;
  amountPaid: number;
  amountExpected: number;
};

export function getPaymentForBillMonth({
  billId,
  month,
  year,
  payments,
}: {
  billId: string;
  month: number;
  year: number;
  payments: Payment[];
}) {
  return (
    payments.find(
      (payment) =>
        payment.billId === billId &&
        payment.month === month &&
        payment.year === year
    ) || null
  );
}

export function getPaymentChecklist({
  bills,
  payments,
  month,
  year,
}: {
  bills: Bill[];
  payments: Payment[];
  month: number;
  year: number;
}): PaymentChecklistItem[] {
  return bills.map((bill) => {
    const payment = getPaymentForBillMonth({
      billId: bill.id,
      month,
      year,
      payments,
    });

    const amountPaid = payment ? Number(payment.amountPaid || 0) : 0;
    const amountExpected = Number(bill.minimumPayment || 0);

    let status: PaymentChecklistStatus = "UNPAID";

    if (payment) {
      status = payment.status;

      if (payment.status === "PAID" && amountPaid < amountExpected) {
        status = "PARTIAL";
      }
    }

    return {
      bill,
      payment,
      status,
      amountPaid,
      amountExpected,
    };
  });
}

export function getChecklistSummary(items: PaymentChecklistItem[]) {
  return {
    paid: items.filter((item) => item.status === "PAID").length,
    partial: items.filter((item) => item.status === "PARTIAL").length,
    unpaid: items.filter((item) => item.status === "UNPAID").length,
    skipped: items.filter((item) => item.status === "SKIPPED").length,
    overdue: items.filter((item) => item.status === "OVERDUE").length,
  };
}

export type PaymentChecklistFilter =
  | "ALL"
  | "NEEDS_ATTENTION"
  | "PAID"
  | "PARTIAL"
  | "UNPAID"
  | "OVERDUE"
  | "SKIPPED";

export function filterPaymentChecklistItems(
  items: PaymentChecklistItem[],
  filter: PaymentChecklistFilter
) {
  if (filter === "ALL") {
    return items;
  }

  if (filter === "NEEDS_ATTENTION") {
    return items.filter((item) =>
      ["UNPAID", "PARTIAL", "OVERDUE"].includes(item.status)
    );
  }

  return items.filter((item) => item.status === filter);
}