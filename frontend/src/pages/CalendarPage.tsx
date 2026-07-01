import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBills } from "../services/billService";
import { getPayments } from "../services/paymentService";
import type { Bill } from "../types/bill";
import type { PaymentChecklistStatus } from "../utils/paymentChecklistUtils";
import type { Payment } from "../types/payment";
import { formatCurrency } from "../utils/currency";
import {
  filterPaymentChecklistItems,
  getChecklistSummary,
  getPaymentChecklist,
  getPaymentForBillMonth,
  type PaymentChecklistFilter,
} from "../utils/paymentChecklistUtils";
import {
  getCalendarDays,
  getMonthLabel,
  getNextMonth,
  getPreviousMonth,
} from "../utils/calendarUtils";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checklistFilter, setChecklistFilter] =
  useState<PaymentChecklistFilter>("ALL");

  useEffect(() => {
    async function loadBills() {
      setError("");

      try {
        const [billsResponse, paymentsResponse] = await Promise.all([
          getBills(),
          getPayments(),
        ]);

        setBills(billsResponse.bills);
        setPayments(paymentsResponse.payments);
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

  const selectedMonthNumber = selectedMonth.getMonth() + 1;
  const selectedYear = selectedMonth.getFullYear();

  const paymentChecklist = useMemo(() => {
    return getPaymentChecklist({
      bills,
      payments,
      month: selectedMonthNumber,
      year: selectedYear,
    });
  }, [bills, payments, selectedMonthNumber, selectedYear]);

  const checklistSummary = useMemo(() => {
    return getChecklistSummary(paymentChecklist);
  }, [paymentChecklist]);

  const filteredPaymentChecklist = useMemo(() => {
    return filterPaymentChecklistItems(paymentChecklist, checklistFilter);
  }, [paymentChecklist, checklistFilter]);

  function getBillsForDay(dayNumber: number) {
    return bills.filter((bill) => bill.dueDay === dayNumber);
  }

  function getBillChecklistStatus(billId: string): PaymentChecklistStatus {
    const payment = getPaymentForBillMonth({
      billId,
      month: selectedMonthNumber,
      year: selectedYear,
      payments,
    });

    if (!payment) {
      return "UNPAID";
    }

    return payment.status;
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
            <div className="section-heading">
              <p className="eyebrow">Payment Checklist</p>
              <h2>{getMonthLabel(selectedMonth)} Status</h2>
            </div>

            <div className="checklist-summary-row">
              <button type="button" onClick={() => setChecklistFilter("PAID")}>
                Paid: {checklistSummary.paid}
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter("PARTIAL")}
              >
                Partial: {checklistSummary.partial}
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter("UNPAID")}
              >
                Unpaid: {checklistSummary.unpaid}
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter("OVERDUE")}
              >
                Overdue: {checklistSummary.overdue}
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter("SKIPPED")}
              >
                Skipped: {checklistSummary.skipped}
              </button>
            </div>

            <div className="checklist-filter-row">
              {[
                "ALL",
                "NEEDS_ATTENTION",
                "PAID",
                "PARTIAL",
                "UNPAID",
                "OVERDUE",
                "SKIPPED",
              ].map((filter) => (
                <button
                  className={
                    checklistFilter === filter ? "filter-button--active" : ""
                  }
                  key={filter}
                  type="button"
                  onClick={() =>
                    setChecklistFilter(filter as PaymentChecklistFilter)
                  }
                >
                  {filter.replaceAll("_", " ")}
                </button>
              ))}
            </div>

            {filteredPaymentChecklist.length === 0 ? (
              <p className="status-message">
                No checklist items match this filter.
              </p>
            ) : (
              <div className="checklist-table-wrap">
                <table className="checklist-table">
                  <thead>
                    <tr>
                      <th>Bill</th>
                      <th>Due Day</th>
                      <th>Status</th>
                      <th>Expected</th>
                      <th>Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPaymentChecklist.map((item) => (
                      <tr
                        className={`checklist-row checklist-row--${item.status.toLowerCase()}`}
                        key={item.bill.id}
                      >
                        <td>{item.bill.name}</td>
                        <td>{item.bill.dueDay}</td>
                        <td>{item.status}</td>
                        <td>{formatCurrency(item.amountExpected)}</td>
                        <td>{formatCurrency(item.amountPaid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                      <div
                        className={`calendar-bill calendar-bill--${getBillChecklistStatus(
                          bill.id
                        ).toLowerCase()}`}
                        key={bill.id}
                      >
                        <span>{bill.name}</span>
                        <strong>{formatCurrency(bill.minimumPayment)}</strong>
                        <em>{getBillChecklistStatus(bill.id)}</em>
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