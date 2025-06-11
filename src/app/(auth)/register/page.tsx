"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";
import "../auth.css";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }
  
    setLoading(true);
  
    try {
      await registerUser(form);
      router.push("/login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit} className="form">
        <h2>Register</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="input"
          required
        />

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
<input
  type="password"
  name="password_confirmation"
  placeholder="Confirm Password"
  value={form.password_confirmation || ""}
  onChange={handleChange}
  className="input"
  required
/>

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="select"
        >
          <option value="user">I want to buy assets</option>
          <option value="creator">I want to sell assets</option>
        </select>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="button" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <a href="/login" className="link">
          Already have an account? Login
        </a>
      </form>
    </div>
  );
}