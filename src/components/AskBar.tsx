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
    <div className="card p-4 sm:p-5">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          className="input flex-1"
          placeholder="Ask your network anything... e.g. who's worked in fintech?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary shrink-0" disabled={loading}>
          {loading ? "Finding matches..." : "Ask"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setText(ex)}
            className="text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
