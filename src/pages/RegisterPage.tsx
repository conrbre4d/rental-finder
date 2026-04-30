import { useState } from "react";
import { Link } from "react-router-dom";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    fetch("http://4.237.58.241:3000/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error || data.message?.includes("already")) {
          setMessage(data.error || data.message);
        } else {
          setMessage("Registration successful! You can now log in.");
          setEmail("");
          setPassword("");
        }
      })
      .catch(() => {
        setMessage("Registration failed. Please try again.");
      });
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Register</h1>
        <p>Create an account to rate rental properties.</p>

        <form onSubmit={handleRegister}>
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

          <button type="submit">Register</button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;