"use client";

import { useState } from "react";

export interface ReferralRewardRow {
  id: string;
  referrerName: string;
  referrerEmail: string;
  refereeName: string;
  refereeEmail: string;
  status: string;
  note: string | null;
  createdAt: string;
  rewardedAt: string | null;
}

export default function ReferralRewardsList({ rewards: initial }: { rewards: ReferralRewardRow[] }) {
  const [rewards, setRewards] = useState(initial);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function markRewarded(id: string) {
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/referrals/${id}/reward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteDrafts[id]?.trim() || undefined }),
      });
      if (res.ok) {
        setRewards((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: "REWARDED", note: noteDrafts[id]?.trim() || r.note, rewardedAt: new Date().toISOString() }
              : r
          )
        );
      }
    } finally {
      setPendingId(null);
    }
  }

  if (rewards.length === 0) {
    return <p className="text-sm text-gray-500">No referral rewards yet.</p>;
  }

  return (
    <div className="space-y-3">
      {rewards.map((r) => (
        <div key={r.id} className="card p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{r.referrerName}</span> ({r.referrerEmail}) invited{" "}
                <span className="font-medium">{r.refereeName}</span> ({r.refereeEmail})
              </p>
              <p className="text-xs text-gray-400 mt-1">Activated {new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
            <span
              className={`badge text-xs ${
                r.status === "REWARDED"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {r.status === "REWARDED" ? "Rewarded" : "Pending"}
            </span>
          </div>

          {r.status === "PENDING" ? (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                className="input text-sm flex-1"
                placeholder="What you sent (optional) — e.g. $15 Amazon gift card"
                value={noteDrafts[r.id] ?? ""}
                onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))}
              />
              <button
                type="button"
                className="btn-primary text-sm shrink-0"
                disabled={pendingId === r.id}
                onClick={() => markRewarded(r.id)}
              >
                Mark as rewarded
              </button>
            </div>
          ) : (
            r.note && <p className="text-xs text-gray-500 mt-2">{r.note}</p>
          )}
        </div>
      ))}
    </div>
  );
}
