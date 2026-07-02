import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getBills } from "../services/billService";
import {
  createPayment,
  deletePayment,
  getPayments,
  updatePayment,
} from "../services/paymentService";
import type { Bill } from "../types/bill";
import type { Payment, PaymentStatus } from "../types/payment";
import { formatCurrency } from "../utils/currency";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

type PaymentHistorySort =
  | "NEWEST"
  | "OLDEST"
  | "HIGHEST_AMOUNT"
  | "LOWEST_AMOUNT"
  | "BILL_NAME";

const paymentStatusOptions: PaymentStatus[] = [
  "PAID",
  "PARTIAL",
  "UNPAID",
  "OVERDUE",
  "SKIPPED",
];

export function PaymentsPage() {
  const [searchParams] = useSearchParams();
  const today = useMemo(() => new Date(), []);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const prefillBillId = searchParams.get("billId");
  const prefillMonth = searchParams.get("month");
  const prefillYear = searchParams.get("year");
  const returnTo = searchParams.get("returnTo");
  const backToCalendarUrl =
    returnTo === "calendar" && prefillMonth && prefillYear
      ? `/calendar?month=${prefillMonth}&year=${prefillYear}&paymentLogged=true`
      : "/calendar";

  const paymentFormRef = useRef<HTMLElement | null>(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [billId, setBillId] = useState(prefillBillId || "");
  const [month, setMonth] = useState(prefillMonth || String(currentMonth));
  const [year, setYear] = useState(prefillYear || String(currentYear));
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    today.toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<PaymentStatus>("PAID");
  const [notes, setNotes] = useState("");
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentPendingDelete, setPaymentPendingDelete] =
  useState<Payment | null>(null);

  const [historyStatusFilter, setHistoryStatusFilter] =
    useState<"ALL" | PaymentStatus>("ALL");
  const [historyMonthFilter, setHistoryMonthFilter] = useState(
    String(currentMonth)
  );
  const [historyYearFilter, setHistoryYearFilter] = useState(
    String(currentYear)
  );
  const [historyBillFilter, setHistoryBillFilter] = useState("ALL");
  const [historySort, setHistorySort] =
    useState<PaymentHistorySort>("NEWEST");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadInitialPaymentData() {
      setError("");

      try {
        const [paymentsResponse, billsResponse] = await Promise.all([
          getPayments(),
          getBills(),
        ]);

        setPayments(paymentsResponse.payments);
        setBills(billsResponse.bills);

        if (billsResponse.bills.length > 0) {
          const selectedBill =
            billsResponse.bills.find((bill) => bill.id === prefillBillId) ||
            billsResponse.bills[0];

          setBillId(selectedBill.id);
          setAmountPaid(String(selectedBill.minimumPayment));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payments");
      } finally {
        setLoading(false);
      }
    }

    loadInitialPaymentData();
  }, []);

  async function refreshPaymentData() {
    setError("");

    try {
      const [paymentsResponse, billsResponse] = await Promise.all([
        getPayments(),
        getBills(),
      ]);

      setPayments(paymentsResponse.payments);
      setBills(billsResponse.bills);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    }
  }

  const totalPaid = useMemo(() => {
    return payments.reduce((total, payment) => {
      return total + Number(payment.amountPaid || 0);
    }, 0);
  }, [payments]);

  const currentMonthPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        payment.month === currentMonth && payment.year === currentYear
    );
  }, [payments, currentMonth, currentYear]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus =
        historyStatusFilter === "ALL" || payment.status === historyStatusFilter;

      const matchesMonth =
        !historyMonthFilter || payment.month === Number(historyMonthFilter);

      const matchesYear =
        !historyYearFilter || payment.year === Number(historyYearFilter);

      const matchesBill =
        historyBillFilter === "ALL" || payment.billId === historyBillFilter;

      return matchesStatus && matchesMonth && matchesYear && matchesBill;
    });
  }, [
    payments,
    historyStatusFilter,
    historyMonthFilter,
    historyYearFilter,
    historyBillFilter,
  ]);

  const sortedFilteredPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      if (historySort === "NEWEST") {
        const aDate = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const bDate = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;

        return bDate - aDate;
      }

      if (historySort === "OLDEST") {
        const aDate = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const bDate = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;

        return aDate - bDate;
      }

      if (historySort === "HIGHEST_AMOUNT") {
        return Number(b.amountPaid || 0) - Number(a.amountPaid || 0);
      }

      if (historySort === "LOWEST_AMOUNT") {
        return Number(a.amountPaid || 0) - Number(b.amountPaid || 0);
      }

      return a.bill.name.localeCompare(b.bill.name);
    });
  }, [filteredPayments, historySort]);

  const filteredTotalPaid = useMemo(() => {
    return filteredPayments.reduce((total, payment) => {
      return total + Number(payment.amountPaid || 0);
    }, 0);
  }, [filteredPayments]);

  const filteredAveragePayment = useMemo(() => {
    if (filteredPayments.length === 0) {
      return 0;
    }

    return filteredTotalPaid / filteredPayments.length;
  }, [filteredPayments.length, filteredTotalPaid]);

  const filteredHighestPayment = useMemo(() => {
    if (filteredPayments.length === 0) {
      return 0;
    }

    return Math.max(
      ...filteredPayments.map((payment) => Number(payment.amountPaid || 0))
    );
  }, [filteredPayments]);

  function startEditingPayment(payment: Payment) {
    setEditingPaymentId(payment.id);
    setBillId(payment.billId);
    setMonth(String(payment.month));
    setYear(String(payment.year));
    setAmountPaid(String(payment.amountPaid));
    setPaymentDate(
      payment.paymentDate
        ? new Date(payment.paymentDate).toISOString().slice(0, 10)
        : today.toISOString().slice(0, 10)
    );
    setStatus(payment.status);
    setNotes(payment.notes || "");
    setError("");
    setSuccess("");

    paymentFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();

    if (!billId) {
      setError("Select a bill before logging a payment.");
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const paymentPayload = {
        billId,
        month: Number(month),
        year: Number(year),
        amountPaid: Number(amountPaid),
        paymentDate,
        status,
        notes,
      };

      if (editingPaymentId) {
        await updatePayment(editingPaymentId, paymentPayload);
        setSuccess("Payment updated successfully.");
      } else {
        await createPayment(paymentPayload);
        setSuccess("Payment logged successfully.");
      }

      setEditingPaymentId(null);
      setNotes("");
      await refreshPaymentData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log payment");
    } finally {
      setSubmitting(false);
    }
  };

  async function confirmDeletePayment() {
    if (!paymentPendingDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deletePayment(paymentPendingDelete.id);
      setPaymentPendingDelete(null);
      setSuccess("Payment deleted successfully.");
      await refreshPaymentData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete payment");
    }
  }

  function exportPaymentHistoryCsv() {
    const headers = [
      "Bill",
      "Month",
      "Year",
      "Status",
      "Amount Paid",
      "Payment Date",
      "Notes",
    ];

    const rows = sortedFilteredPayments.map((payment) => [
      payment.bill.name,
      String(payment.month),
      String(payment.year),
      payment.status,
      String(payment.amountPaid),
      payment.paymentDate
        ? new Date(payment.paymentDate).toLocaleDateString()
        : "",
      payment.notes || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `debt-command-payment-history-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <main className="page payments-page">
      <header className="page-header">
        <p className="eyebrow">Payment Ledger</p>
        <h1>Payments</h1>
        <p>
          Track payments made toward bills and debts so payoff progress can be
          reviewed over time.
        </p>
      </header>

      {error && <p className="status-message status-message--error">{error}</p>}

      {loading ? (
        <p className="status-message">Loading payment ledger...</p>
      ) : (
        <>
          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Payment Summary</p>
              <h2>Ledger Overview</h2>
            </div>

            <div className="metric-grid metric-grid--compact">
              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">Total Logged Paid</span>
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
                <span className="metric-card__label">This Month</span>
                <strong className="metric-card__value">
                  {currentMonthPayments.length}
                </strong>
              </article>
            </div>
          </section>

          <section className="panel" ref={paymentFormRef}>
            <div className="section-heading">
              <p className="eyebrow">New Payment</p>
              <h2>{editingPaymentId ? "Update Payment" : "Log Payment"}</h2>
            </div>

            {editingPaymentId && (
              <p className="status-message">
                Editing payment. Update the form and save changes.
              </p>
            )}

            <form className="command-form" onSubmit={handleSubmit}>
              <label>
                Bill
                <select
                  value={billId}
                  onChange={(event) => {
                    const selectedBillId = event.target.value;
                    const selectedBill = bills.find(
                      (bill) => bill.id === selectedBillId
                    );

                    setBillId(selectedBillId);

                    if (selectedBill) {
                      setAmountPaid(String(selectedBill.minimumPayment));
                    }
                  }}
                  required
                >
                  {bills.map((bill) => (
                    <option key={bill.id} value={bill.id}>
                      {bill.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Month
                <input
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  type="number"
                  min="1"
                  max="12"
                  required
                />
              </label>

              <label>
                Year
                <input
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  type="number"
                  min="2000"
                  required
                />
              </label>

              <label>
                Amount Paid
                <input
                  value={amountPaid}
                  onChange={(event) => setAmountPaid(event.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Payment Date
                <input
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  type="date"
                />
              </label>

              <label>
                Status
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as PaymentStatus)
                  }
                >
                  {paymentStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Notes
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>

              <button type="submit" disabled={submitting}>
                {submitting
                  ? editingPaymentId
                    ? "Updating..."
                    : "Logging..."
                  : editingPaymentId
                    ? "Update Payment"
                    : "Log Payment"}
              </button>

              {editingPaymentId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPaymentId(null);
                    setNotes("");
                    setSuccess("");
                    setError("");
                  }}
                >
                  Cancel Edit
                </button>
              )}

              {success && (
                <div className="status-message">
                  <p>{success}</p>
                  {returnTo === "calendar" && (
                    <Link to={backToCalendarUrl}>Back to Calendar</Link>
                  )}
                </div>
              )}
            </form>
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Payment History</p>
              <h2>Logged Payments</h2>
            </div>

            <div className="command-form">
              <label>
                Bill
                <select
                  value={historyBillFilter}
                  onChange={(event) => setHistoryBillFilter(event.target.value)}
                >
                  <option value="ALL">ALL</option>
                  {bills.map((bill) => (
                    <option key={bill.id} value={bill.id}>
                      {bill.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status
                <select
                  value={historyStatusFilter}
                  onChange={(event) =>
                    setHistoryStatusFilter(
                      event.target.value as "ALL" | PaymentStatus
                    )
                  }
                >
                  <option value="ALL">ALL</option>
                  {paymentStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Month
                <input
                  value={historyMonthFilter}
                  onChange={(event) => setHistoryMonthFilter(event.target.value)}
                  type="number"
                  min="1"
                  max="12"
                />
              </label>

              <label>
                Year
                <input
                  value={historyYearFilter}
                  onChange={(event) => setHistoryYearFilter(event.target.value)}
                  type="number"
                  min="2000"
                />
              </label>

              <label>
                Sort
                <select
                  value={historySort}
                  onChange={(event) =>
                    setHistorySort(event.target.value as PaymentHistorySort)
                  }
                >
                  <option value="NEWEST">Newest first</option>
                  <option value="OLDEST">Oldest first</option>
                  <option value="HIGHEST_AMOUNT">Highest amount</option>
                  <option value="LOWEST_AMOUNT">Lowest amount</option>
                  <option value="BILL_NAME">Bill name</option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setHistoryBillFilter("ALL");
                  setHistoryStatusFilter("ALL");
                  setHistoryMonthFilter("");
                  setHistoryYearFilter("");
                  setHistorySort("NEWEST");
                }}
              >
                Clear Filters
              </button>

              <button
                type="button"
                onClick={exportPaymentHistoryCsv}
                disabled={sortedFilteredPayments.length === 0}
              >
                Export CSV
              </button>
            </div>

            

            {sortedFilteredPayments.length === 0 ? (
              <p className="status-message">
                No payments match the current filters.
              </p>
            ) : (
              <>
                <div className="metric-grid metric-grid--compact">
                  <article className="metric-card">
                    <span className="metric-card__label">Filtered Payments</span>
                    <strong className="metric-card__value">
                      {sortedFilteredPayments.length}
                    </strong>
                  </article>

                  <article className="metric-card metric-card--accent">
                    <span className="metric-card__label">Filtered Total</span>
                    <strong className="metric-card__value">
                      {formatCurrency(filteredTotalPaid)}
                    </strong>
                  </article>

                  <article className="metric-card">
                    <span className="metric-card__label">Average Payment</span>
                    <strong className="metric-card__value">
                      {formatCurrency(filteredAveragePayment)}
                    </strong>
                  </article>

                  <article className="metric-card">
                    <span className="metric-card__label">Highest Payment</span>
                    <strong className="metric-card__value">
                      {formatCurrency(filteredHighestPayment)}
                    </strong>
                  </article>
                </div>

                <h2>- Results -</h2>

                <ul className="record-list">
                  {sortedFilteredPayments.map((payment) => (
                    <li className="record-card" key={payment.id}>
                      <div>
                        <strong>{payment.bill.name}</strong>
                        <p>
                          {payment.month}/{payment.year} ·{" "}
                          <span className={`status-badge status-badge--${payment.status.toLowerCase()}`}>
                            {payment.status}
                          </span>
                        </p>
                        <p>Amount Paid: {formatCurrency(payment.amountPaid)}</p>
                        {payment.paymentDate && (
                          <p>
                            Payment Date:{" "}
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                        )}
                        {payment.notes && <p>{payment.notes}</p>}
                      </div>

                      <div className="payment-card-actions">
                        <button
                          type="button"
                          onClick={() => startEditingPayment(payment)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPaymentPendingDelete(payment);
                            setError("");
                            setSuccess("");
                          }}
                        >
                          Delete
                        </button>

                        {paymentPendingDelete?.id === payment.id && (
                          <div className="status-message status-message--error">
                            <p>
                              Delete this payment for <strong>{payment.bill.name}?</strong>
                            </p>

                            <p>
                              {payment.month}/{payment.year} · {formatCurrency(payment.amountPaid)}
                            </p>

                            <button type="button" onClick={confirmDeletePayment}>
                              Confirm Delete
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentPendingDelete(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </>
      )}
    </main>
  );
}