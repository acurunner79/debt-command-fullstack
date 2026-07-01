import {
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getBills } from "../services/billService";
import {
  createPayment,
  deletePayment,
  getPayments,
} from "../services/paymentService";
import type { Bill } from "../types/bill";
import type { Payment, PaymentStatus } from "../types/payment";
import { formatCurrency } from "../utils/currency";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

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
        payment.month === currentMonth &&
        payment.year === currentYear
    );
    }, [payments, currentMonth, currentYear]);

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
      await createPayment({
        billId,
        month: Number(month),
        year: Number(year),
        amountPaid: Number(amountPaid),
        paymentDate,
        status,
        notes,
      });

      setNotes("");
      setSuccess("Payment logged successfully.");
      await refreshPaymentData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log payment");
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDeletePayment(id: string) {
    setError("");

    try {
      await deletePayment(id);
      await refreshPaymentData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete payment");
    }
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

      {success && (
        <div className="status-message">
          <p>{success}</p>
          {returnTo === "calendar" && (
            <Link to={backToCalendarUrl}>Back to Calendar</Link>
          )}
        </div>
      )}

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

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">New Payment</p>
              <h2>Log Payment</h2>
            </div>

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
                {submitting ? "Logging..." : "Log Payment"}
              </button>

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

            {payments.length === 0 ? (
              <p className="status-message">No payments logged yet.</p>
            ) : (
              <ul className="record-list">
                {payments.map((payment) => (
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
                      {payment.notes && <p>{payment.notes}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePayment(payment.id)}
                    >
                      Delete
                    </button>
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