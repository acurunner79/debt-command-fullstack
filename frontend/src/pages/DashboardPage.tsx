import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBills } from "../services/billService";
import { getIncomeSources } from "../services/incomeService";
import { getPayoffScenarios } from "../services/payoffScenarioService";
import type { Bill } from "../types/bill";
import type { IncomeSource } from "../types/income";
import type {
  ParsedPayoffScenario,
  PayoffScenario,
} from "../types/payoffScenario";
import { formatCurrency } from "../utils/currency";
import {
  calculateCreditUtilization,
  calculateTotalDebtBalance,
  calculateTotalMinimumPayments,
} from "../utils/billCalculations";
import { calculateTotalMonthlyIncome } from "../utils/incomeCalculations";
import { calculatePayoffTimeline } from "../utils/payoffCalculations";

export function DashboardPage() {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<ParsedPayoffScenario[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function parseScenario(scenario: PayoffScenario): ParsedPayoffScenario {
    return {
      ...scenario,
      strategy: scenario.strategy,
      extraPayment: Number(scenario.extraPayment || 0),
      includedDebtTypes: JSON.parse(scenario.includedDebtTypes),
    };
  }

  useEffect(() => {
    async function loadDashboardData() {
      setError("");

      try {
        const [incomeResponse, billsResponse, scenariosResponse] =
          await Promise.all([
            getIncomeSources(),
            getBills(),
            getPayoffScenarios(),
          ]);

        setIncomeSources(incomeResponse.incomeSources);
        setBills(billsResponse.bills);
        setSavedScenarios(scenariosResponse.scenarios.map(parseScenario));
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

  const defaultPayoffScenario =
  savedScenarios.find((scenario) => scenario.isDefault) || savedScenarios[0];

  const dashboardPayoffTimeline = useMemo(() => {
    if (defaultPayoffScenario) {
      const scenarioBills = bills.filter((bill) =>
        defaultPayoffScenario.includedDebtTypes.includes(bill.type)
      );

      return calculatePayoffTimeline(
        scenarioBills,
        defaultPayoffScenario.strategy,
        defaultPayoffScenario.extraPayment
      );
    }

    const defaultDebtTypes = [
      "CREDIT_CARD",
      "AUTO_LOAN",
      "PERSONAL_LOAN",
      "STUDENT_LOAN",
      "MEDICAL",
      "OTHER",
    ];

    const defaultBills = bills.filter((bill) =>
      defaultDebtTypes.includes(bill.type)
    );

    return calculatePayoffTimeline(defaultBills, "SNOWBALL", 100);
  }, [bills, defaultPayoffScenario]);

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
                <span className="metric-card__label">Remaining Cashflow</span>
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
              <p className="eyebrow">Payoff Operations</p>
              <h2>Debt Attack Summary</h2>
            </div>

            <div className="metric-grid">
              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">Current Target</span>
                <strong className="metric-card__value">
                  {dashboardPayoffTimeline.timeline[0]?.name || "No target"}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Payoff Debt</span>
                <strong className="metric-card__value">
                  {formatCurrency(dashboardPayoffTimeline.totalStartingDebt)}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">
                  Monthly Payoff Budget
                </span>
                <strong className="metric-card__value">
                  {formatCurrency(
                    dashboardPayoffTimeline.totalMonthlyPayoffAmount
                  )}
                </strong>
              </article>

              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">Debt-Free Estimate</span>
                <strong className="metric-card__value">
                  {dashboardPayoffTimeline.estimatedDebtFreeDate || "N/A"}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Saved Scenarios</span>
                <strong className="metric-card__value">
                  {savedScenarios.length}
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

              <Link className="action-card" to="/payoff-planner">
                <span>Payoff Planner</span>
                <strong>Open debt attack plan</strong>
              </Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}