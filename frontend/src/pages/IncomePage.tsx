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
    <main>
      <h1>Income</h1>

      <section>
        <h2>Monthly Income Estimate</h2>
        <p>{formatCurrency(totalMonthlyIncome)}</p>
      </section>

      <section>
        <h2>Add Income Source</h2>

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

          {error && <p>{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add income"}
          </button>
        </form>
      </section>

      <section>
        <h2>Income Sources</h2>

        {loading ? (
          <p>Loading income...</p>
        ) : incomeSources.length === 0 ? (
          <p>No active income sources yet.</p>
        ) : (
          <ul>
            {incomeSources.map((source) => (
              <li key={source.id}>
                <strong>{source.name}</strong> — {formatCurrency(source.amount)}{" "}
                / {source.frequency}
                {source.notes && <p>{source.notes}</p>}
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