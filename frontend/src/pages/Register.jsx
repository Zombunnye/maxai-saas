import { useState } from "react";
import api from "../lib/api";

export default function Register({ onSuccess, onSwitch }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register-client", form);
      onSuccess(); // redirect to login with success message
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">M</div>
        <h1 className="auth-title">Get started free</h1>
        <p className="auth-sub">Create your MaxAI account in seconds</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label">Your Name</label>
          <input className="auth-input" type="text" placeholder="John Smith" value={form.name} onChange={set("name")} required />

          <label className="field-label">Business Name</label>
          <input className="auth-input" type="text" placeholder="Acme Ltd" value={form.businessName} onChange={set("businessName")} required />

          <label className="field-label">Email</label>
          <input className="auth-input" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} required />

          <label className="field-label">Password</label>
          <input className="auth-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set("password")} required minLength={6} />

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button className="switch-link" onClick={onSwitch}>Sign in</button>
        </p>
      </div>
    </div>
  );
}
