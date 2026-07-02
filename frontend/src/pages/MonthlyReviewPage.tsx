import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBills } from "../services/billService";
import { getPayments } from "../services/paymentService";
import type { Bill } from "../types/bill";
import type { Payment } from "../types/payment";
import { formatCurrency } from "../utils/currency";

export function MonthlyReviewPage() {
  const today = useMemo(() => new Date(), []);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(String(currentMonth));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMonthlyReviewData() {
      setError("");

      try {
        const [billsResponse, paymentsResponse] = await Promise.all([
          getBills(),
          getPayments(),
        ]);

        setBills(billsResponse.bills);
        setPayments(paymentsResponse.payments);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load monthly review"
        );
      } finally {
        setLoading(false);
      }
    }

    loadMonthlyReviewData();
  }, []);

  const selectedMonthPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        payment.month === Number(selectedMonth) &&
        payment.year === Number(selectedYear)
    );
  }, [payments, selectedMonth, selectedYear]);

  const totalPaid = useMemo(() => {
    return selectedMonthPayments.reduce((total, payment) => {
      return total + Number(payment.amountPaid || 0);
    }, 0);
  }, [selectedMonthPayments]);

  return (
    <main className="page monthly-review-page">
      <header className="page-header">
        <p className="eyebrow">Monthly Review</p>
        <h1>Review Report</h1>
        <p>
          Review monthly payment activity, payment totals, and bill completion
          status.
        </p>
      </header>

      {error && <p className="status-message status-message--error">{error}</p>}

      {loading ? (
        <p className="status-message">Loading monthly review...</p>
      ) : (
        <>
          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Report Period</p>
              <h2>
                {selectedMonth}/{selectedYear}
              </h2>
            </div>

            <div className="command-form">
              <label>
                Month
                <input
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  type="number"
                  min="1"
                  max="12"
                />
              </label>

              <label>
                Year
                <input
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  type="number"
                  min="2000"
                />
              </label>
            </div>

            <div className="metric-grid metric-grid--compact">
              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">Total Paid</span>
                <strong className="metric-card__value">
                  {formatCurrency(totalPaid)}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Payments Logged</span>
                <strong className="metric-card__value">
                  {selectedMonthPayments.length}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Active Bills</span>
                <strong className="metric-card__value">{bills.length}</strong>
              </article>
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Review Actions</p>
              <h2>Open Tools</h2>
            </div>

            <div className="action-grid">
              <Link className="action-card" to="/payments">
                <span>Payment Ledger</span>
                <strong>Review payments</strong>
              </Link>

              <Link
                className="action-card"
                to={`/calendar?month=${selectedMonth}&year=${selectedYear}`}
              >
                <span>Payment Calendar</span>
                <strong>Review checklist</strong>
              </Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}