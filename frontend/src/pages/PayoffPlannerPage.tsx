import { useEffect, useMemo, useState } from "react";
import { getBills } from "../services/billService";
import type { Bill } from "../types/bill";
import type { PayoffStrategy } from "../types/payoff";
import { formatCurrency } from "../utils/currency";
import {
  calculatePayoffPlan,
  calculateTotalDebtMinimums,
  getPayoffDebts,
} from "../utils/payoffCalculations";

export function PayoffPlannerPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [strategy, setStrategy] = useState<PayoffStrategy>("SNOWBALL");
  const [extraPayment, setExtraPayment] = useState("100");
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

  const payoffDebts = useMemo(() => getPayoffDebts(bills), [bills]);

  const payoffPlan = useMemo(() => {
    return calculatePayoffPlan(bills, strategy);
  }, [bills, strategy]);

  const totalMinimums = useMemo(() => {
    return calculateTotalDebtMinimums(bills);
  }, [bills]);

  const totalMonthlyPayoffAmount = totalMinimums + Number(extraPayment || 0);

  return (
    <main className="page payoff-page">
      <header className="page-header">
        <p className="eyebrow">Debt Elimination Protocol</p>
        <h1>Payoff Planner</h1>
        <p>
          Compare payoff priority using snowball or avalanche strategy based on
          your active bill balances.
        </p>
      </header>

      {error && <p className="status-message status-message--error">{error}</p>}

      {loading ? (
        <p className="status-message">Loading payoff planner...</p>
      ) : (
        <>
          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Scenario Controls</p>
              <h2>Strategy Setup</h2>
            </div>

            <form className="command-form">
              <label>
                Payoff Strategy
                <select
                  value={strategy}
                  onChange={(event) =>
                    setStrategy(event.target.value as PayoffStrategy)
                  }
                >
                  <option value="SNOWBALL">Snowball — Smallest balance first</option>
                  <option value="AVALANCHE">
                    Avalanche — Highest interest first
                  </option>
                </select>
              </label>

              <label>
                Extra Monthly Payment
                <input
                  value={extraPayment}
                  onChange={(event) => setExtraPayment(event.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                />
              </label>
            </form>
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Payoff Summary</p>
              <h2>Current Scenario</h2>
            </div>

            <div className="metric-grid metric-grid--compact">
              <article className="metric-card">
                <span className="metric-card__label">Debts Included</span>
                <strong className="metric-card__value">
                  {payoffDebts.length}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Minimum Payments</span>
                <strong className="metric-card__value">
                  {formatCurrency(totalMinimums)}
                </strong>
              </article>

              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">Total Payoff Budget</span>
                <strong className="metric-card__value">
                  {formatCurrency(totalMonthlyPayoffAmount)}
                </strong>
              </article>
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Attack Order</p>
              <h2>Recommended Payoff Plan</h2>
            </div>

            {payoffPlan.length === 0 ? (
              <p className="status-message">
                No active debts with balances found. Add bill balances to create
                a payoff plan.
              </p>
            ) : (
              <ul className="record-list">
                {payoffPlan.map((item) => (
                  <li className="record-card" key={item.billId}>
                    <div>
                      <strong>
                        #{item.priority} · {item.name}
                      </strong>
                      <p>{item.type}</p>
                      <p>Balance: {formatCurrency(item.balance)}</p>
                      <p>Minimum: {formatCurrency(item.minimumPayment)}</p>
                      <p>Interest Rate: {item.interestRate.toFixed(2)}%</p>
                      <p>{item.strategyReason}</p>
                    </div>
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