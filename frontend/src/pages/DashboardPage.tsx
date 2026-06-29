import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBills } from "../services/billService";
import { getIncomeSources } from "../services/incomeService";
import type { Bill } from "../types/bill";
import type { IncomeSource } from "../types/income";
import { formatCurrency } from "../utils/currency";
import {
  calculateCreditUtilization,
  calculateTotalDebtBalance,
  calculateTotalMinimumPayments,
} from "../utils/billCalculations";
import { calculateTotalMonthlyIncome } from "../utils/incomeCalculations";

export function DashboardPage() {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      setError("");

      try {
        const [incomeResponse, billsResponse] = await Promise.all([
          getIncomeSources(),
          getBills(),
        ]);

        setIncomeSources(incomeResponse.incomeSources);
        setBills(billsResponse.bills);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const monthlyIncome = useMemo(() => {
    return calculateTotalMonthlyIncome(incomeSources);
  }, [incomeSources]);

  const monthlyMinimumPayments = useMemo(() => {
    return calculateTotalMinimumPayments(bills);
  }, [bills]);

  const monthlyRemainingCashflow = monthlyIncome - monthlyMinimumPayments;

  const totalDebtBalance = useMemo(() => {
    return calculateTotalDebtBalance(bills);
  }, [bills]);

  const creditUtilization = useMemo(() => {
    return calculateCreditUtilization(bills);
  }, [bills]);

  return (
    <main className="page dashboard-page">
      <header className="page-header">
        <p className="eyebrow">Financial Mission Control</p>
        <h1>Dashboard</h1>
        <p>
          Monitor income, minimum obligations, available monthly cashflow, and
          debt exposure.
        </p>
      </header>

      {error && <p className="status-message status-message--error">{error}</p>}

      {loading ? (
        <p className="status-message">Loading command center...</p>
      ) : (
        <>
          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Command Summary</p>
              <h2>Monthly Overview</h2>
            </div>

            <div className="metric-grid">
              <article className="metric-card">
                <span className="metric-card__label">Monthly Income</span>
                <strong className="metric-card__value">
                  {formatCurrency(monthlyIncome)}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">
                  Minimum Bill Payments
                </span>
                <strong className="metric-card__value">
                  {formatCurrency(monthlyMinimumPayments)}
                </strong>
              </article>

              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">
                  Remaining Cashflow
                </span>
                <strong className="metric-card__value">
                  {formatCurrency(monthlyRemainingCashflow)}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Total Debt Balance</span>
                <strong className="metric-card__value">
                  {formatCurrency(totalDebtBalance)}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Credit Utilization</span>
                <strong className="metric-card__value">
                  {creditUtilization.toFixed(1)}%
                </strong>
              </article>
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Quick Actions</p>
              <h2>Manage Records</h2>
            </div>

            <div className="action-grid">
              <Link className="action-card" to="/income">
                <span>Manage Income</span>
                <strong>Open income sources</strong>
              </Link>

              <Link className="action-card" to="/bills">
                <span>Manage Bills</span>
                <strong>Open bill registry</strong>
              </Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}