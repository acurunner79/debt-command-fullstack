import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
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
  const { user, logoutUser } = useAuth();

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
    <main>
      <h1>DebtCommand Dashboard</h1>

      <p>
        Signed in as <strong>{user?.email}</strong>
      </p>

      {error && <p>{error}</p>}

      {loading ? (
        <p>Loading command center...</p>
      ) : (
        <>
          <section>
            <h2>Command Summary</h2>

            <p>Monthly Income: {formatCurrency(monthlyIncome)}</p>
            <p>
              Monthly Minimum Bill Payments:{" "}
              {formatCurrency(monthlyMinimumPayments)}
            </p>
            <p>
              Estimated Monthly Remaining Cashflow:{" "}
              {formatCurrency(monthlyRemainingCashflow)}
            </p>
            <p>Total Debt Balance: {formatCurrency(totalDebtBalance)}</p>
            <p>Credit Utilization: {creditUtilization.toFixed(1)}%</p>
          </section>

          <section>
            <h2>Quick Actions</h2>

            <p>
              <Link to="/income">Manage Income</Link>
            </p>

            <p>
              <Link to="/bills">Manage Bills</Link>
            </p>
          </section>
        </>
      )}

      <button type="button" onClick={logoutUser}>
        Logout
      </button>
    </main>
  );
}