"use client";

import { useState } from "react";

export interface Lead {
  id: string;
  name: string;
  email: string;
  note: string | null;
  createdAt: string;
}

export default function LeadsReview({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function act(id: string, action: "approve" | "dismiss") {
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}/${action}`, { method: "POST" });
      if (res.ok) setLeads((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setPendingId(null);
    }
  }

  if (leads.length === 0) {
    return <p className="text-sm text-gray-500">No new leads waiting on review.</p>;
  }

  return (
    <div className="space-y-3">
      {leads.map((l) => (
        <div key={l.id} className="card p-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-gray-900">{l.name}</p>
            <p className="text-sm text-gray-500">{l.email}</p>
            {l.note && <p className="text-sm text-gray-500 mt-1">"{l.note}"</p>}
            <p className="text-xs text-gray-400 mt-1">{new Date(l.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              className="btn-secondary text-sm"
              disabled={pendingId === l.id}
              onClick={() => act(l.id, "dismiss")}
            >
              Dismiss
            </button>
            <button
              type="button"
              className="btn-primary text-sm"
              disabled={pendingId === l.id}
              onClick={() => act(l.id, "approve")}
            >
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
