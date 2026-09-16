"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MatchRespondButtons({
  matchId,
  opportunity = false,
}: {
  matchId: string;
  // true for JOB_OPENING / HIRING_GIG_WORK requests: the member is being
  // asked "are you interested?" rather than "can you help?".
  opportunity?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  async function respond(action: "accept" | "decline") {
    setLoading(action);
    await fetch(`/api/matches/${matchId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    router.refresh();
  }

  const acceptLabel = opportunity ? "I'm interested" : "Accept";
  const declineLabel = opportunity ? "Not for me" : "Decline";

  return (
    <div className="flex gap-2 mt-3">
      <button className="btn-primary" disabled={!!loading} onClick={() => respond("accept")}>
        {loading === "accept" ? "Saving..." : acceptLabel}
      </button>
      <button className="btn-secondary" disabled={!!loading} onClick={() => respond("decline")}>
        {loading === "decline" ? "Saving..." : declineLabel}
      </button>
    </div>
  );
}
