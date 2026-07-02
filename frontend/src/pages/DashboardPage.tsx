import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBills } from "../services/billService";
import { getIncomeSources } from "../services/incomeService";
import { getPayoffScenarios } from "../services/payoffScenarioService";
import { getPayments } from "../services/paymentService";
import type { Payment } from "../types/payment";
import { getAutomationNotifications } from "../utils/automationUtils";
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
  const [payments, setPayments] = useState<Payment[]>([]);
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
        const [incomeResponse, billsResponse, scenariosResponse, paymentsResponse] =
          await Promise.all([
            getIncomeSources(),
            getBills(),
            getPayoffScenarios(),
            getPayments(),
          ]);

        setIncomeSources(incomeResponse.incomeSources);
        setBills(billsResponse.bills);
        setSavedScenarios(scenariosResponse.scenarios.map(parseScenario));
        setPayments(paymentsResponse.payments);
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

  const today = useMemo(() => new Date(), []);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const currentMonthPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        payment.month === currentMonth &&
        payment.year === currentYear
    );
  }, [payments, currentMonth, currentYear]);

  const currentMonthPaidTotal = useMemo(() => {
    return currentMonthPayments.reduce((total, payment) => {
      return total + Number(payment.amountPaid || 0);
    }, 0);
  }, [currentMonthPayments]);

  const unpaidOrPartialBillsThisMonth = useMemo(() => {
    return bills.filter((bill) => {
      const payment = currentMonthPayments.find(
        (currentPayment) => currentPayment.billId === bill.id
      );

      if (!payment) {
        return true;
      }

      return payment.status === "UNPAID" || payment.status === "PARTIAL";
    });
  }, [bills, currentMonthPayments]);

  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => {
        const aDate = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const bDate = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;

        return bDate - aDate;
      })
      .slice(0, 3);
  }, [payments]);

  const automationNotices = useMemo(() => {
    return getAutomationNotifications({
      bills,
      payments,
      savedScenarios,
    }).slice(0, 3);
  }, [bills, payments, savedScenarios]);

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
              <p className="eyebrow">Payment Intelligence</p>
              <h2>This Month</h2>
            </div>

            <div className="metric-grid metric-grid--compact">
              <article className="metric-card metric-card--accent">
                <span className="metric-card__label">Payments Logged</span>
                <strong className="metric-card__value">
                  {currentMonthPayments.length}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Paid This Month</span>
                <strong className="metric-card__value">
                  {formatCurrency(currentMonthPaidTotal)}
                </strong>
              </article>

              <article className="metric-card">
                <span className="metric-card__label">Needs Attention</span>
                <strong className="metric-card__value">
                  {unpaidOrPartialBillsThisMonth.length}
                </strong>
              </article>
            </div>

            {recentPayments.length > 0 && (
              <>
                <h3>Recent Payments</h3>

                <ul className="record-list">
                  {recentPayments.map((payment) => (
                    <li className="record-card" key={payment.id}>
                      <div>
                        <strong>{payment.bill.name}</strong>
                        <p>
                          {payment.month}/{payment.year} · {payment.status}
                        </p>
                        <p>{formatCurrency(payment.amountPaid)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="action-grid">
              <Link className="action-card" to="/payments">
                <span>Payment Ledger</span>
                <strong>Review payments</strong>
              </Link>

              <Link className="action-card" to="/calendar">
                <span>Payment Calendar</span>
                <strong>Review checklist</strong>
              </Link>
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Automation Review</p>
              <h2>Priority Notices</h2>
            </div>

            {automationNotices.length === 0 ? (
              <p className="status-message">No priority notices right now.</p>
            ) : (
              <ul className="record-list">
                {automationNotices.map((notice) => (
                  <li
                    className={`record-card notification-card notification-card--${notice.severity.toLowerCase()}`}
                    key={notice.id}
                  >
                    <div>
                      <strong>{notice.title}</strong>
                      <p>{notice.message}</p>
                      <p>Severity: {notice.severity}</p>
                    </div>

                    <Link className="action-card" to={notice.actionPath}>
                      <span>{notice.actionLabel}</span>
                      <strong>Open</strong>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
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