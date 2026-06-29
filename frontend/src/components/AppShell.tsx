import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export function AppShell() {
  const { user, logoutUser } = useAuth();

  return (
    <div>
      <header>
        <h1>DebtCommand</h1>

        <p>
          Signed in as <strong>{user?.email}</strong>
        </p>

        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>{" "}
          <NavLink to="/income">Income</NavLink>{" "}
          <NavLink to="/bills">Bills</NavLink>
        </nav>

        <button type="button" onClick={logoutUser}>
          Logout
        </button>
      </header>

      <Outlet />
    </div>
  );
}