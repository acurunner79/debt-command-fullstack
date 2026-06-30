import type { Bill } from "../types/bill";
import { formatCurrency } from "./currency";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "URGENT";
  actionLabel: string;
  actionPath: string;
};

function getCurrentDayOfMonth() {
  return new Date().getDate();
}

function getDaysUntilDue(dueDay: number) {
  const today = getCurrentDayOfMonth();

  if (dueDay >= today) {
    return dueDay - today;
  }

  return 31 - today + dueDay;
}

export function getBillNotifications(bills: Bill[]): AppNotification[] {
  const notifications: AppNotification[] = [];

  bills.forEach((bill) => {
    const daysUntilDue = getDaysUntilDue(bill.dueDay);

    if (daysUntilDue === 0) {
      notifications.push({
        id: `bill-due-today-${bill.id}`,
        title: `${bill.name} is due today`,
        message: `${formatCurrency(
          bill.minimumPayment
        )} minimum payment due today.${bill.autopay ? " Autopay is enabled." : ""}`,
        severity: "URGENT",
        actionLabel: "Open Bills",
        actionPath: "/bills",
      });
    }

    if (daysUntilDue > 0 && daysUntilDue <= 7) {
      notifications.push({
        id: `bill-due-soon-${bill.id}`,
        title: `${bill.name} due in ${daysUntilDue} day${
          daysUntilDue === 1 ? "" : "s"
        }`,
        message: `${formatCurrency(
          bill.minimumPayment
        )} minimum payment due on day ${bill.dueDay}.${
          bill.autopay ? " Autopay is enabled." : ""
        }`,
        severity: "WARNING",
        actionLabel: "Open Calendar",
        actionPath: "/calendar",
      });
    }
  });

  return notifications;
}

export function getMonthlyReviewNotification(): AppNotification {
  return {
    id: "monthly-balance-review",
    title: "Monthly balance review",
    message:
      "Review account balances and update your payoff planner so projections stay accurate.",
    severity: "INFO",
    actionLabel: "Open Payoff Planner",
    actionPath: "/payoff-planner",
  };
}