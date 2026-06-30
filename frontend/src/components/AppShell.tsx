import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export function AppShell() {
  const { user, logoutUser } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <p className="eyebrow">Debt Operations Console</p>
          <h1>DebtCommand</h1>
          <p className="app-header__user">
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>

        <nav className="app-nav" aria-label="Primary navigation">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/income">Income</NavLink>
          <NavLink to="/bills">Bills</NavLink>
          <NavLink to="/payoff-planner">Payoff Planner</NavLink>
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/notifications">Notifications</NavLink>
          <NavLink to="/payments">Payments</NavLink>
        </nav>

        <button className="app-header__logout" type="button" onClick={logoutUser}>
          Logout
        </button>
      </header>

      <div className="app-shell__content">
        <Outlet />
      </div>
    </div>
  );
}