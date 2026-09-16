"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MatchRespondButtons({ matchId }: { matchId: string }) {
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

  return (
    <div className="flex gap-2 mt-3">
      <button className="btn-primary" disabled={!!loading} onClick={() => respond("accept")}>
        {loading === "accept" ? "Accepting..." : "Accept"}
      </button>
      <button className="btn-secondary" disabled={!!loading} onClick={() => respond("decline")}>
        {loading === "decline" ? "Declining..." : "Decline"}
      </button>
    </div>
  );
}
