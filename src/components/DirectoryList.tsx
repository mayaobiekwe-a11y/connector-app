"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import { PROFILE_TYPE_LABELS } from "@/lib/labels";

export interface DirectoryMember {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  industry: string | null;
  bio: string | null;
  avatarUrl: string | null;
  profileType: string;
  badgeLabel: string;
  relationships: string[];
  sideHustleNames: string[];
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

export default function DirectoryList({ members }: { members: DirectoryMember[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name, m.title, m.company, m.industry, m.bio, ...m.relationships, ...m.sideHustleNames]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [members, query]);

  return (
    <div>
      <input
        className="input mb-4"
        placeholder="Search by name, company, industry, or connection..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No members match that search.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((m) => (
            <Link key={m.id} href={`/profile/${m.id}`} className="card p-4 hover:border-brand-300 block">
              <div className="flex items-start gap-3">
                <Avatar name={m.name} avatarUrl={m.avatarUrl} size={44} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{m.name}</p>
                    {m.profileType === "SERVICE_PROVIDER" && (
                      <span className="badge bg-purple-50 text-purple-700 border border-purple-100 text-xs">
                        {PROFILE_TYPE_LABELS.SERVICE_PROVIDER}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {m.title ?? "Member"} {m.company ? `at ${m.company}` : ""}
                  </p>
                  {m.sideHustleNames.length > 0 && (
                    <p className="text-xs text-gray-500">🚀 {m.sideHustleNames.join(", ")}</p>
                  )}
                  <span className="badge bg-brand-50 text-brand-700 border border-brand-100 text-xs mt-1 inline-block">
                    {m.badgeLabel}
                  </span>
                </div>
              </div>
              {m.bio && <p className="text-sm text-gray-600 mt-3">{truncate(m.bio, 140)}</p>}
              {m.relationships.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {m.relationships.slice(0, 3).map((r) => (
                    <span key={r} className="badge bg-gray-100 text-gray-600 text-xs">
                      {r}
                    </span>
                  ))}
                  {m.relationships.length > 3 && (
                    <span className="text-xs text-gray-400 self-center">+{m.relationships.length - 3} more</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
