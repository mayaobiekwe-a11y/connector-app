"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ClaimForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
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
    <form onSubmit={onSubmit} className="card p-5 space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="label">Email</label>
        <input className="input bg-gray-50" value={email} disabled />
      </div>
      <div>
        <label className="label">Set a password</label>
        <input
          className="input"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Claiming..." : "Claim your account"}
      </button>
    </form>
  );
}
