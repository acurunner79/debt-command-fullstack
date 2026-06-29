import { useAuth } from "../context/useAuth";

export function DashboardPage() {
  const { user, logoutUser } = useAuth();

  return (
    <main>
      <h1>DebtCommand Dashboard</h1>

      <p>
        Signed in as <strong>{user?.email}</strong>
      </p>

      <section>
        <h2>Mission Status</h2>
        <p>Frontend authentication is connected.</p>
      </section>

      <button type="button" onClick={logoutUser}>
        Logout
      </button>
    </main>
  );
}