import { useState, type ComponentProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export function LoginPage() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("Password123");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit: FormSubmitHandler = async (event) => {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await loginUser({ email, password });
            navigate("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setSubmitting(false);
        }
    };  

    return (
    <main>
        <h1>DebtCommand</h1>
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
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
            {submitting ? "Signing in..." : "Sign in"}
        </button>
        </form>

        <p>
        Need an account? <Link to="/register">Register</Link>
        </p>
    </main>
    );
}