import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBills } from "../services/billService";
import type { Bill } from "../types/bill";
import {
  getBillNotifications,
  getMonthlyReviewNotification,
} from "../utils/notificationUtils";
import { getPayments } from "../services/paymentService";
import { getPayoffScenarios } from "../services/payoffScenarioService";
import type { Payment } from "../types/payment";
import type {
  ParsedPayoffScenario,
  PayoffScenario,
} from "../types/payoffScenario";
import { getAutomationNotifications } from "../utils/automationUtils";



export function NotificationsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<ParsedPayoffScenario[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function parseScenario(scenario: PayoffScenario): ParsedPayoffScenario {
    return {
      ...scenario,
      strategy: scenario.strategy,
      extraPayment: Number(scenario.extraPayment || 0),
      includedDebtTypes: JSON.parse(scenario.includedDebtTypes),
    };
  }

  useEffect(() => {
    async function loadBills() {
      setError("");

      try {
        const [billsResponse, paymentsResponse, scenariosResponse] =
          await Promise.all([
            getBills(),
            getPayments(),
            getPayoffScenarios(),
          ]);

        setBills(billsResponse.bills);
        setPayments(paymentsResponse.payments);
        setSavedScenarios(scenariosResponse.scenarios.map(parseScenario));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load automation notices"
        );
      } finally {
        setLoading(false);
      }
    }

    loadBills();
  }, []);

  const notifications = useMemo(() => {
    return [
      ...getBillNotifications(bills),
      ...getAutomationNotifications({
        bills,
        payments,
        savedScenarios,
      }),
      getMonthlyReviewNotification(),
    ];
  }, [bills, payments, savedScenarios]);

  return (
    <main className="page notifications-page">
      <header className="page-header">
        <p className="eyebrow">Review Protocol</p>
        <h1>Notifications</h1>
        <p>
          Review upcoming bills, due-today alerts, and monthly payoff planning
          reminders.
        </p>
      </header>

      {error && <p className="status-message status-message--error">{error}</p>}

      {loading ? (
        <p className="status-message">Loading notifications...</p>
      ) : (
        <>
          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Alert Summary</p>
              <h2>Mission Notices</h2>
            </div>

            <div className="metric-grid metric-grid--compact">
              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">Active Notices</span>
                <strong className="metric-card__value">
                  {notifications.length}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Upcoming Bills</span>
                <strong className="metric-card__value">
                  {
                    notifications.filter(
                      (notification) => notification.severity === "WARNING"
                    ).length
                  }
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Due Today</span>
                <strong className="metric-card__value">
                  {
                    notifications.filter(
                      (notification) => notification.severity === "URGENT"
                    ).length
                  }
                </strong>
              </article>
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Notification Feed</p>
              <h2>Action Items</h2>
            </div>

            {notifications.length === 0 ? (
              <p className="status-message">No notifications available.</p>
            ) : (
              <ul className="record-list">
                {notifications.map((notification) => (
                  <li
                    className={`record-card notification-card notification-card--${notification.severity.toLowerCase()}`}
                    key={notification.id}
                  >
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                      <p>Severity: {notification.severity}</p>
                    </div>

                    <Link className="action-card" to={notification.actionPath}>
                      <span>{notification.actionLabel}</span>
                      <strong>Open</strong>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}