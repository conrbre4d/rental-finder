import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    fetch("http://4.237.58.241:3000/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          setMessage("Login successful!");
          navigate("/search");
        } else {
          setMessage(data.error || data.message || "Login failed.");
        }
      })
      .catch(() => {
        setMessage("Login failed. Please try again.");
      });
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        <p>Log in to rate rental properties.</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-link">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;