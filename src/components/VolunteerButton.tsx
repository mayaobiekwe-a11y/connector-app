"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VolunteerButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/requests/${requestId}/volunteer`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push(`/requests/${requestId}`);
    router.refresh();
  }

  return (
    <div>
      <button className="btn-primary" onClick={onClick} disabled={loading}>
        {loading ? "Jumping in..." : "I can help"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
