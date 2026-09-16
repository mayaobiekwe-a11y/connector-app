"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-6">Log in to your network.</p>
      <form onSubmit={onSubmit} className="card p-5 space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        New here?{" "}
        <Link href="/signup" className="text-brand-700 font-medium">
          Create an account
        </Link>
      </p>
      <p className="text-xs text-gray-400 mt-6">
        Demo accounts: jordan@example.com, priya@example.com, marcus@example.com... — password{" "}
        <code>password123</code>
      </p>
    </div>
  );
}
