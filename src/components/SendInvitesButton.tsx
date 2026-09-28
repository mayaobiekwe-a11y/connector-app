"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendInvitesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/admin/import/send-invites", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setResult("Something went wrong sending invites.");
      return;
    }
    const data = await res.json();
    setResult(`Sent ${data.sent} invite${data.sent === 1 ? "" : "s"}.`);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={onClick} disabled={loading} className="btn-primary">
        {loading ? "Sending..." : "Send claim invites"}
      </button>
      {result && <p className="text-sm text-gray-600">{result}</p>}
    </div>
  );
}
