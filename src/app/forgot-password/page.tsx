"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    // Always show the same confirmation, whether or not that email has an
    // account — never reveal who's a member.
    setSent(true);
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter the email on your account and we'll send a link to set a new password.
      </p>

      {sent ? (
        <div className="card p-5 text-sm text-gray-700">
          If an account exists for <strong>{email}</strong>, a reset link is on its way. It's
          good for the next hour.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card p-5 space-y-4">
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
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="text-sm text-gray-500 mt-4">
        <Link href="/login" className="text-brand-700 font-medium">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
