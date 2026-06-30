import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBills } from "../services/billService";
import type { Bill } from "../types/bill";
import { formatCurrency } from "../utils/currency";
import {
  getCalendarDays,
  getMonthLabel,
  getNextMonth,
  getPreviousMonth,
} from "../utils/calendarUtils";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBills() {
      setError("");

      try {
        const response = await getBills();
        setBills(response.bills);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bills");
      } finally {
        setLoading(false);
      }
    }

    loadBills();
  }, []);

  const calendarDays = useMemo(() => {
    return getCalendarDays(selectedMonth);
  }, [selectedMonth]);

  const monthlyMinimumTotal = useMemo(() => {
    return bills.reduce((total, bill) => {
      return total + Number(bill.minimumPayment || 0);
    }, 0);
  }, [bills]);

  function getBillsForDay(dayNumber: number) {
    return bills.filter((bill) => bill.dueDay === dayNumber);
  }

  return (
    <main className="page calendar-page">
      <header className="page-header">
        <p className="eyebrow">Payment Schedule</p>
        <h1>Calendar</h1>
        <p>
          View active bills by due day and plan monthly payment obligations.
        </p>
      </header>

      {error && <p className="status-message status-message--error">{error}</p>}

      {loading ? (
        <p className="status-message">Loading calendar...</p>
      ) : (
        <>
          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Monthly Schedule</p>
              <h2>{getMonthLabel(selectedMonth)}</h2>
            </div>

            <div className="command-form">
              <button
                type="button"
                onClick={() => setSelectedMonth(getPreviousMonth(selectedMonth))}
              >
                Previous Month
              </button>

              <button
                type="button"
                onClick={() => setSelectedMonth(new Date())}
              >
                Current Month
              </button>

              <button
                type="button"
                onClick={() => setSelectedMonth(getNextMonth(selectedMonth))}
              >
                Next Month
              </button>
            </div>

            <div className="metric-grid metric-grid--compact">
              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">
                  Monthly Minimum Total
                </span>
                <strong className="metric-card__value">
                  {formatCurrency(monthlyMinimumTotal)}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Active Bills</span>
                <strong className="metric-card__value">{bills.length}</strong>
              </article>
            </div>
          </section>

          <section className="panel">
            <div className="calendar-grid calendar-grid--header">
              {weekDays.map((day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((day) => {
                const dayBills = day.isCurrentMonth
                  ? getBillsForDay(day.dayNumber)
                  : [];

                return (
                  <article
                    className={
                      day.isCurrentMonth
                        ? "calendar-day"
                        : "calendar-day calendar-day--muted"
                    }
                    key={day.date.toISOString()}
                  >
                    <strong>{day.dayNumber}</strong>

                    {dayBills.map((bill) => (
                      <div className="calendar-bill" key={bill.id}>
                        <span>{bill.name}</span>
                        <strong>{formatCurrency(bill.minimumPayment)}</strong>
                        {bill.autopay && <em>Autopay</em>}
                      </div>
                    ))}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Calendar Actions</p>
              <h2>Manage Schedule</h2>
            </div>

            <div className="action-grid">
              <Link className="action-card" to="/bills">
                <span>Bill Registry</span>
                <strong>Update bills and due days</strong>
              </Link>

              <Link className="action-card" to="/payoff-planner">
                <span>Payoff Planner</span>
                <strong>Review debt attack plan</strong>
              </Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}