import { useEffect, useMemo, useState, type ComponentProps } from "react";
import {
  archiveIncomeSource,
  createIncomeSource,
  getIncomeSources,
} from "../services/incomeService";
import type { IncomeFrequency, IncomeSource } from "../types/income";
import { formatCurrency } from "../utils/currency";
import { calculateTotalMonthlyIncome } from "../utils/incomeCalculations";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

const frequencyOptions: IncomeFrequency[] = [
  "WEEKLY",
  "BIWEEKLY",
  "SEMIMONTHLY",
  "MONTHLY",
  "YEARLY",
  "ONETIME",
];

export function IncomePage() {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [name, setName] = useState("Primary Income");
  const [amount, setAmount] = useState("4600");
  const [frequency, setFrequency] = useState<IncomeFrequency>("MONTHLY");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalMonthlyIncome = useMemo(
    () => calculateTotalMonthlyIncome(incomeSources),
    [incomeSources]
  );

  async function loadIncomeSources() {
    setError("");

    try {
      const response = await getIncomeSources();
      setIncomeSources(response.incomeSources);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load income");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadInitialIncomeSources() {
      setError("");

      try {
        const response = await getIncomeSources();
        setIncomeSources(response.incomeSources);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load income");
      } finally {
        setLoading(false);
      }
    }

    loadInitialIncomeSources();
  }, []);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await createIncomeSource({
        name,
        amount: Number(amount),
        frequency,
        notes,
      });

      setName("");
      setAmount("");
      setFrequency("MONTHLY");
      setNotes("");

      await loadIncomeSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create income");
    } finally {
      setSubmitting(false);
    }
  };

  async function handleArchive(id: string) {
    setError("");

    try {
      await archiveIncomeSource(id);
      await loadIncomeSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive income");
    }
  }

  return (
    <main className="page income-page">
      <header className="page-header">
        <p className="eyebrow">Income Registry</p>
        <h1>Income</h1>
        <p>
          Track active income sources and estimate normalized monthly income for
          the command dashboard.
        </p>
      </header>

      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">Monthly Estimate</p>
          <h2>Income Summary</h2>
        </div>

        <div className="metric-grid metric-grid--compact">
          <article className="metric-card metric-card--accent">
            <span className="metric-card__label">Total Monthly Income</span>
            <strong className="metric-card__value">
              {formatCurrency(totalMonthlyIncome)}
            </strong>
          </article>

          <article className="metric-card">
            <span className="metric-card__label">Active Sources</span>
            <strong className="metric-card__value">
              {incomeSources.length}
            </strong>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">New Record</p>
          <h2>Add Income Source</h2>
        </div>

        <form className="command-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Amount
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              min="0"
              step="0.01"
              required
            />
          </label>

          <label>
            Frequency
            <select
              value={frequency}
              onChange={(event) =>
                setFrequency(event.target.value as IncomeFrequency)
              }
            >
              {frequencyOptions.map((option) => (
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

          {error && (
            <p className="status-message status-message--error">{error}</p>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add income"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">Active Records</p>
          <h2>Income Sources</h2>
        </div>

        {loading ? (
          <p className="status-message">Loading income...</p>
        ) : incomeSources.length === 0 ? (
          <p className="status-message">No active income sources yet.</p>
        ) : (
          <ul className="record-list">
            {incomeSources.map((source) => (
              <li className="record-card" key={source.id}>
                <div>
                  <strong>{source.name}</strong>
                  <p>
                    {formatCurrency(source.amount)} / {source.frequency}
                  </p>
                  {source.notes && <p>{source.notes}</p>}
                </div>

                <button type="button" onClick={() => handleArchive(source.id)}>
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