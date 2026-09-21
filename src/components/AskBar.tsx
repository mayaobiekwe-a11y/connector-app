"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  "Who in this group has a connection at a healthcare startup in DC?",
  "I need someone who's worked in public policy to review my resume.",
  "Looking for an ongoing mentor in product management.",
  "We're hiring a product designer — know anyone great, or interested yourself?",
  "I'm looking for freelance/contract work this month, ideally in design.",
];

export default function AskBar() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setText("");
    router.push(`/requests/${data.request.id}`);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/70 to-accent-50/40 p-4 sm:p-6 shadow-sm">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          className="input flex-1 bg-white text-base py-3"
          placeholder="Ask your network anything... e.g. who's worked in fintech?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary shrink-0 px-6 py-3 text-base" disabled={loading}>
          {loading ? (
            "Finding matches..."
          ) : (
            <>
              Ask
              <svg className="ml-1.5 h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 10h12M12 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
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
    </div>
  );
}
