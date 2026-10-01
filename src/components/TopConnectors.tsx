import Link from "next/link";
import Avatar from "./Avatar";

export interface TopConnector {
  id: string;
  name: string;
  avatarUrl: string | null;
  badgeLabel: string;
}

// Surfaces the community's most engaged members by reputation points (see
// src/lib/credit.ts) so showing up and following through is visibly
// rewarded, not just something that happens quietly in the background.
export default function TopConnectors({ members }: { members: TopConnector[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900">Top connectors</h2>
      <p className="text-xs text-gray-500 mb-3">
        The members who consistently respond and follow through when someone reaches out.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {members.map((m, i) => (
          <Link
            key={m.id}
            href={`/profile/${m.id}`}
            className="card p-3 flex items-center gap-2 shrink-0 hover:border-brand-300"
          >
            <span className="text-xs font-semibold text-gray-400 w-4">{i + 1}</span>
            <Avatar name={m.name} avatarUrl={m.avatarUrl} size={32} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
              <p className="text-xs text-brand-700">{m.badgeLabel}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
