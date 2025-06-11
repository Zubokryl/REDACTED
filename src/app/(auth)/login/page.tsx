'use client';

import { useState } from "react";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import "../auth.css";

export default function LoginPage() {

  const { setAuth } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { user } = await loginUser(form);
      console.log("Cookies after login:", document.cookie);

      setAuth({ user, profile: null, models: [] });

      if (user.role === "creator") {
        window.location.href = "/creator/profile";
      } else if (user.role === "admin") {
        window.location.href = "/admin/profile";
      } else if (user.role === "user") {
        window.location.href = "/user/profile";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };


   return (
    <div className="wrapper">
      <form onSubmit={handleSubmit} className="form">
        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="input"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="input"
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <a href="/register" className="link">
          No account yet? Register
        </a>
      </form>
    </div>
  );
}