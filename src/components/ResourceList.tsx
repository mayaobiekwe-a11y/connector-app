"use client";

import { useState } from "react";
import { NEED_CATEGORY_LABELS } from "@/lib/labels";

export interface AdminResource {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  phone: string | null;
  categories: string[];
}

export default function ResourceList({ resources: initial }: { resources: AdminResource[] }) {
  const [resources, setResources] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function remove(id: string) {
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
      if (res.ok) setResources((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setPendingId(null);
    }
  }

  if (resources.length === 0) {
    return <p className="text-sm text-gray-500">No resources added yet.</p>;
  }

  return (
    <div className="space-y-3">
      {resources.map((r) => (
        <div key={r.id} className="card p-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-gray-900">{r.name}</p>
            {r.description && <p className="text-sm text-gray-500 mt-1">{r.description}</p>}
            <p className="text-xs text-gray-400 mt-1">
              {[r.url, r.phone].filter(Boolean).join(" · ")}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {r.categories.map((c) => (
                <span key={c} className="badge bg-gray-100 text-gray-600 text-xs">
                  {NEED_CATEGORY_LABELS[c] ?? c}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="btn-danger text-sm shrink-0"
            disabled={pendingId === r.id}
            onClick={() => remove(r.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
