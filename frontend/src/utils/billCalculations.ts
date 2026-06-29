import type { Bill } from "../types/bill";

export function calculateTotalMinimumPayments(bills: Bill[]) {
  return bills.reduce((total, bill) => {
    return total + Number(bill.minimumPayment);
  }, 0);
}

export function calculateTotalDebtBalance(bills: Bill[]) {
  return bills.reduce((total, bill) => {
    return total + Number(bill.balance || 0);
  }, 0);
}

export function calculateCreditUtilization(bills: Bill[]) {
  const creditCards = bills.filter((bill) => bill.type === "CREDIT_CARD");

  const totalBalance = creditCards.reduce((total, bill) => {
    return total + Number(bill.balance || 0);
  }, 0);

  const totalLimit = creditCards.reduce((total, bill) => {
    return total + Number(bill.creditLimit || 0);
  }, 0);

  if (totalLimit <= 0) {
    return 0;
  }

  return (totalBalance / totalLimit) * 100;
}