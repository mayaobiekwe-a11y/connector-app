"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { INTENT_LABELS } from "@/lib/labels";

const EXAMPLES = [
  "Who in this group has a connection at a healthcare startup in DC?",
  "I need someone who's worked in public policy to review my resume.",
  "Looking for an ongoing mentor in product management.",
  "I'm looking for freelance/contract work this month, ideally in design.",
];

// The key the signup/claim flows look for in sessionStorage to pick this
// ask back up and fire it for real the moment the visitor has an account.
export const PENDING_ASK_KEY = "mobi_pending_ask";

interface PreviewResult {
  summary: string;
  intent: string;
}

export default function HomeAskBar() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PreviewResult | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/ask-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      sessionStorage.setItem(PENDING_ASK_KEY, text);
      setResult({ summary: data.summary, intent: data.intent });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/70 to-accent-50/40 p-4 sm:p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Mobi understood</p>
        <p className="mt-1 text-lg text-gray-900">{result.summary}</p>
        {INTENT_LABELS[result.intent] && (
          <span className="badge bg-white text-brand-700 border border-brand-200 text-xs mt-2 inline-block">
            {INTENT_LABELS[result.intent]}
          </span>
        )}
        <p className="mt-4 text-sm text-gray-700">
          Create a free account and Mobi will find who in the network can actually help with this.
        </p>
        <div className="mt-3 flex gap-3">
          <Link href="/signup" className="btn-primary text-base px-6 py-3">
            Create free account
          </Link>
          <Link href="/login" className="btn-secondary text-base px-6 py-3">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          className="input flex-1 bg-white text-base py-3"
          placeholder="What do you need? e.g. who's worked in fintech?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary shrink-0 px-6 py-3 text-base" disabled={loading}>
          {loading ? "Thinking..." : "Ask Mobi"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setText(ex)}
            className="text-xs text-gray-600 bg-white border border-gray-200 hover:border-brand-300 hover:text-brand-700 rounded-full px-3 py-1.5 transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Already on Mobi?{" "}
        <Link href="/login" className="text-brand-700 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
