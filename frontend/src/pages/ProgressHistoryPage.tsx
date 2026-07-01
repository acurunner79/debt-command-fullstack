import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPayments } from "../services/paymentService";
import type { Payment } from "../types/payment";
import { formatCurrency } from "../utils/currency";
import {
  calculateTotalPaid,
  getMonthlyPaymentSummaries,
  getRecentPayments,
} from "../utils/paymentCalculations";

export function ProgressHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPayments() {
      setError("");

      try {
        const response = await getPayments();
        setPayments(response.payments);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load progress history"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  const totalPaid = useMemo(() => {
    return calculateTotalPaid(payments);
  }, [payments]);

  const monthlySummaries = useMemo(() => {
    return getMonthlyPaymentSummaries(payments);
  }, [payments]);

  const recentPayments = useMemo(() => {
    return getRecentPayments(payments);
  }, [payments]);

  return (
    <main className="page progress-history-page">
      <header className="page-header">
        <p className="eyebrow">Progress Archive</p>
        <h1>Progress History</h1>
        <p>
          Review logged payments by month and track payoff activity over time.
        </p>
      </header>

      {error && <p className="status-message status-message--error">{error}</p>}

      {loading ? (
        <p className="status-message">Loading progress history...</p>
      ) : (
        <>
          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Progress Summary</p>
              <h2>Payment Activity</h2>
            </div>

            <div className="metric-grid metric-grid--compact">
              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">Total Paid Logged</span>
                <strong className="metric-card__value">
                  {formatCurrency(totalPaid)}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Payments Logged</span>
                <strong className="metric-card__value">
                  {payments.length}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Months Tracked</span>
                <strong className="metric-card__value">
                  {monthlySummaries.length}
                </strong>
              </article>
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Monthly Progress</p>
              <h2>Payments by Month</h2>
            </div>

            {monthlySummaries.length === 0 ? (
              <p className="status-message">
                No monthly payment history yet. Log payments to begin tracking
                progress.
              </p>
            ) : (
              <ul className="record-list">
                {monthlySummaries.map((summary) => (
                  <li className="record-card" key={summary.key}>
                    <div>
                      <strong>{summary.label}</strong>
                      <p>Total Paid: {formatCurrency(summary.totalPaid)}</p>
                      <p>Payments Logged: {summary.paymentCount}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Recent Activity</p>
              <h2>Latest Payments</h2>
            </div>

            {recentPayments.length === 0 ? (
              <p className="status-message">No recent payments yet.</p>
            ) : (
              <ul className="record-list">
                {recentPayments.map((payment) => (
                  <li className="record-card" key={payment.id}>
                    <div>
                      <strong>{payment.bill.name}</strong>
                      <p>
                        {payment.month}/{payment.year} · {payment.status}
                      </p>
                      <p>Amount Paid: {formatCurrency(payment.amountPaid)}</p>
                      {payment.paymentDate && (
                        <p>
                          Payment Date:{" "}
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Progress Actions</p>
              <h2>Continue Tracking</h2>
            </div>

            <div className="action-grid">
              <Link className="action-card" to="/payments">
                <span>Payment Ledger</span>
                <strong>Log or review payments</strong>
              </Link>

              <Link className="action-card" to="/payoff-planner">
                <span>Payoff Planner</span>
                <strong>Review payoff projection</strong>
              </Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}