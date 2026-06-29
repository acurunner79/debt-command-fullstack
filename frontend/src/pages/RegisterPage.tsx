import { useState, type ComponentProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [name, setName] = useState("Test User");
  const [email, setEmail] = useState("test2@example.com");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await registerUser({ name, email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <h1>DebtCommand</h1>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            type="text"
          />
        </label>

        <label>
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>

        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
          />
        </label>

        {error && <p>{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  );
}