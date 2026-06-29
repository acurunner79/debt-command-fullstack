import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { archiveBill, createBill, getBills } from "../services/billService";
import type { Bill, BillType } from "../types/bill";
import { formatCurrency } from "../utils/currency";
import {
  calculateCreditUtilization,
  calculateTotalDebtBalance,
  calculateTotalMinimumPayments,
} from "../utils/billCalculations";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

const billTypeOptions: BillType[] = [
  "CREDIT_CARD",
  "AUTO_LOAN",
  "PERSONAL_LOAN",
  "MORTGAGE",
  "RENT",
  "UTILITY",
  "INSURANCE",
  "SUBSCRIPTION",
  "MEDICAL",
  "STUDENT_LOAN",
  "OTHER",
];

export function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [name, setName] = useState("Test Credit Card");
  const [type, setType] = useState<BillType>("CREDIT_CARD");
  const [dueDay, setDueDay] = useState("15");
  const [balance, setBalance] = useState("1200");
  const [minimumPayment, setMinimumPayment] = useState("45");
  const [creditLimit, setCreditLimit] = useState("5000");
  const [interestRate, setInterestRate] = useState("24.99");
  const [autopay, setAutopay] = useState(false);
  const [recurring, setRecurring] = useState(true);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalMinimumPayments = useMemo(
    () => calculateTotalMinimumPayments(bills),
    [bills]
  );

  const totalDebtBalance = useMemo(
    () => calculateTotalDebtBalance(bills),
    [bills]
  );

  const creditUtilization = useMemo(
    () => calculateCreditUtilization(bills),
    [bills]
  );

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

  useEffect(() => {
    async function loadInitialBills() {
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

    loadInitialBills();
  }, []);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await createBill({
        name,
        type,
        dueDay: Number(dueDay),
        balance: balance ? Number(balance) : null,
        minimumPayment: Number(minimumPayment),
        creditLimit: creditLimit ? Number(creditLimit) : null,
        interestRate: interestRate ? Number(interestRate) : null,
        autopay,
        recurring,
        notes,
      });

      setName("");
      setType("CREDIT_CARD");
      setDueDay("");
      setBalance("");
      setMinimumPayment("");
      setCreditLimit("");
      setInterestRate("");
      setAutopay(false);
      setRecurring(true);
      setNotes("");

      await loadBills();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bill");
    } finally {
      setSubmitting(false);
    }
  };

  async function handleArchive(id: string) {
    setError("");

    try {
      await archiveBill(id);
      await loadBills();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive bill");
    }
  }

  return (
    <main>
      <h1>Bills</h1>

      <section>
        <h2>Bill Summary</h2>
        <p>Total Minimum Payments: {formatCurrency(totalMinimumPayments)}</p>
        <p>Total Debt Balance: {formatCurrency(totalDebtBalance)}</p>
        <p>Credit Utilization: {creditUtilization.toFixed(1)}%</p>
      </section>

      <section>
        <h2>Add Bill</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Type
            <select
              value={type}
              onChange={(event) => setType(event.target.value as BillType)}
            >
              {billTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Due Day
            <input
              value={dueDay}
              onChange={(event) => setDueDay(event.target.value)}
              type="number"
              min="1"
              max="31"
              required
            />
          </label>

          <label>
            Balance
            <input
              value={balance}
              onChange={(event) => setBalance(event.target.value)}
              type="number"
              min="0"
              step="0.01"
            />
          </label>

          <label>
            Minimum Payment
            <input
              value={minimumPayment}
              onChange={(event) => setMinimumPayment(event.target.value)}
              type="number"
              min="0"
              step="0.01"
              required
            />
          </label>

          <label>
            Credit Limit
            <input
              value={creditLimit}
              onChange={(event) => setCreditLimit(event.target.value)}
              type="number"
              min="0"
              step="0.01"
            />
          </label>

          <label>
            Interest Rate
            <input
              value={interestRate}
              onChange={(event) => setInterestRate(event.target.value)}
              type="number"
              min="0"
              step="0.01"
            />
          </label>

          <label>
            <input
              checked={autopay}
              onChange={(event) => setAutopay(event.target.checked)}
              type="checkbox"
            />
            Autopay
          </label>

          <label>
            <input
              checked={recurring}
              onChange={(event) => setRecurring(event.target.checked)}
              type="checkbox"
            />
            Recurring
          </label>

          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          {error && <p>{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add bill"}
          </button>
        </form>
      </section>

      <section>
        <h2>Active Bills</h2>

        {loading ? (
          <p>Loading bills...</p>
        ) : bills.length === 0 ? (
          <p>No active bills yet.</p>
        ) : (
          <ul>
            {bills.map((bill) => (
              <li key={bill.id}>
                <strong>{bill.name}</strong> — {bill.type}
                <p>Due Day: {bill.dueDay}</p>
                <p>Balance: {formatCurrency(bill.balance || 0)}</p>
                <p>Minimum: {formatCurrency(bill.minimumPayment)}</p>
                {bill.creditLimit && (
                  <p>Credit Limit: {formatCurrency(bill.creditLimit)}</p>
                )}
                {bill.notes && <p>{bill.notes}</p>}
                <button type="button" onClick={() => handleArchive(bill.id)}>
                  Archive
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}