"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import StarRatingInput from "./StarRatingInput";

type Outcome = "HELPED" | "DIDNT_WORK_OUT" | "NO_RESPONSE";

const OUTCOME_OPTIONS: { value: Outcome; label: string }[] = [
  { value: "HELPED", label: "They helped" },
  { value: "DIDNT_WORK_OUT", label: "Didn't work out" },
  { value: "NO_RESPONSE", label: "No response" },
];

export default function ReviewForm({ requestId, matchId }: { requestId: string; matchId: string }) {
  const router = useRouter();
  const [outcome, setOutcome] = useState<Outcome>("HELPED");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/requests/${requestId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        outcome,
        rating: outcome === "HELPED" ? rating : undefined,
        comment: comment || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  if (!open) {
    return (
      <button className="btn-secondary mt-3" onClick={() => setOpen(true)}>
        Log outcome
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="label">What happened?</label>
        <div className="flex flex-wrap gap-2">
          {OUTCOME_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setOutcome(opt.value)}
              className={`text-sm rounded-full px-3 py-1 border ${
                outcome === opt.value
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {outcome === "HELPED" && (
        <div>
          <label className="label">Rating</label>
          <StarRatingInput value={rating} onChange={setRating} />
        </div>
      )}
      <div>
        <label className="label">Comment (optional)</label>
        <textarea className="input" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={loading || (outcome === "HELPED" && rating === 0)}>
          {loading ? "Saving..." : "Submit"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
