import { useEffect, useMemo, useState } from "react";
import { getBills } from "../services/billService";
import type { Bill } from "../types/bill";
import type { PayoffStrategy } from "../types/payoff";
import { formatCurrency } from "../utils/currency";
import {
  calculatePayoffTimeline,
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

  const payoffTimeline = useMemo(() => {
    return calculatePayoffTimeline(bills, strategy, Number(extraPayment || 0));
  }, [bills, strategy, extraPayment]);

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
                  <option value="SNOWBALL">
                    Snowball — Smallest balance first
                  </option>
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
                <span className="metric-card__label">Starting Debt</span>
                <strong className="metric-card__value">
                  {formatCurrency(payoffTimeline.totalStartingDebt)}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Minimum Payments</span>
                <strong className="metric-card__value">
                  {formatCurrency(payoffTimeline.totalMinimumPayments)}
                </strong>
              </article>

              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">Total Payoff Budget</span>
                <strong className="metric-card__value">
                  {formatCurrency(payoffTimeline.totalMonthlyPayoffAmount)}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Estimated Timeline</span>
                <strong className="metric-card__value">
                  {payoffTimeline.estimatedTotalMonths} months
                </strong>
              </article>

              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">Debt-Free Estimate</span>
                <strong className="metric-card__value">
                  {payoffTimeline.estimatedDebtFreeDate || "N/A"}
                </strong>
              </article>
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Timeline Projection</p>
              <h2>Estimated Payoff Path</h2>
            </div>

            {payoffTimeline.timeline.length === 0 ? (
              <p className="status-message">
                No active debts with balances found. Add bill balances to create
                a payoff timeline.
              </p>
            ) : (
              <ul className="record-list">
                {payoffTimeline.timeline.map((item) => (
                  <li className="record-card" key={item.billId}>
                    <div>
                      <strong>
                        #{item.priority} · {item.name}
                      </strong>
                      <p>{item.type}</p>
                      <p>Starting Balance: {formatCurrency(item.startingBalance)}</p>
                      <p>
                        Monthly Payment Applied:{" "}
                        {formatCurrency(item.monthlyPaymentApplied)}
                      </p>
                      <p>Estimated Time: {item.estimatedMonths} months</p>
                      <p>Estimated Payoff: {item.estimatedPayoffDate}</p>
                      <p>
                        Remaining Debt After Payoff:{" "}
                        {formatCurrency(item.remainingDebtAfterPayoff)}
                      </p>
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