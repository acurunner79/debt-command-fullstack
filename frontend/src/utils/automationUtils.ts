import type { Bill } from "../types/bill";
import type { Payment } from "../types/payment";
import type { ParsedPayoffScenario } from "../types/payoffScenario";
import type { AppNotification } from "./notificationUtils";

function getCurrentDayOfMonth() {
  return new Date().getDate();
}

function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function isLastWeekOfMonth() {
  const today = new Date();
  const lastDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  return lastDayOfMonth - today.getDate() <= 7;
}

export function getAutomationNotifications({
  bills,
  payments,
  savedScenarios,
}: {
  bills: Bill[];
  payments: Payment[];
  savedScenarios: ParsedPayoffScenario[];
}): AppNotification[] {
  const notifications: AppNotification[] = [];
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  const paymentsThisMonth = payments.filter((payment) => {
    return payment.month === currentMonth && payment.year === currentYear;
  });

  if (isLastWeekOfMonth()) {
    notifications.push({
      id: "automation-balance-review",
      title: "Monthly balance review",
      message:
        "The month is almost over. Review account balances so payoff projections stay accurate.",
      severity: "INFO",
      actionLabel: "Open Bills",
      actionPath: "/bills",
    });
  }

  if (paymentsThisMonth.length === 0 && bills.length > 0) {
    notifications.push({
      id: "automation-payment-logging",
      title: "Payment logging reminder",
      message:
        "No payments have been logged for this month. Log payments to keep progress history current.",
      severity: "WARNING",
      actionLabel: "Open Payments",
      actionPath: "/payments",
    });
  }

  if (savedScenarios.length === 0) {
    notifications.push({
      id: "automation-scenario-review",
      title: "Create a payoff scenario",
      message:
        "Save a payoff scenario so the dashboard and planner can quickly reference your preferred debt strategy.",
      severity: "INFO",
      actionLabel: "Open Payoff Planner",
      actionPath: "/payoff-planner",
    });
  }

  if (payments.length > 0) {
    notifications.push({
      id: "automation-progress-review",
      title: "Review payoff progress",
      message:
        "You have logged payments. Review progress history to see month-by-month payoff activity.",
      severity: "INFO",
      actionLabel: "Open Progress",
      actionPath: "/progress-history",
    });
  }

  if (getCurrentDayOfMonth() <= 7 && bills.length > 0) {
    notifications.push({
      id: "automation-month-start-review",
      title: "Start-of-month payment review",
      message:
        "Review this month’s bills and confirm which payments need attention.",
      severity: "INFO",
      actionLabel: "Open Calendar",
      actionPath: "/calendar",
    });
  }

  return notifications;
}