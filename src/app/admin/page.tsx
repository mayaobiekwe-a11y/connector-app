import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import StatusPill from "@/components/StatusPill";
import { REQUEST_STATUS_LABELS, MATCH_STATUS_LABELS, INTENT_LABELS } from "@/lib/labels";

export default async function AdminPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (!member.isAdmin) {
    return <p className="text-sm text-gray-500">This page is only available to community admins.</p>;
  }

  const requests = await prisma.request.findMany({
    where: { communityId: member.communityId },
    include: { requester: true, matches: { include: { member: true }, orderBy: { rank: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const open = requests.filter((r) => r.status === "OPEN").length;
  const inFlight = requests.filter((r) => r.status === "MATCHED" || r.status === "IN_PROGRESS").length;
  const completed = requests.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Admin — {member.community.name}</h1>
        <p className="text-sm text-gray-500">All requests, how the AI parsed them, and match status.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-semibold text-gray-900">{open}</p>
          <p className="text-xs text-gray-500">Open, unmatched</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-semibold text-gray-900">{inFlight}</p>
          <p className="text-xs text-gray-500">In progress</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-semibold text-gray-900">{completed}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
      </div>

      <div className="space-y-3">
        {requests.length === 0 && <p className="text-sm text-gray-500">No requests yet.</p>}
        {requests.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  {r.requester.name} · {new Date(r.createdAt).toLocaleString()}
                </p>
                <Link href={`/requests/${r.id}`} className="font-medium text-gray-900 hover:text-brand-700">
                  "{r.rawText}"
                </Link>
              </div>
              <StatusPill status={r.status} label={REQUEST_STATUS_LABELS[r.status] ?? r.status} />
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-500">
              <p>
                Intent: <span className="text-gray-700">{r.parsedIntent ? INTENT_LABELS[r.parsedIntent] ?? r.parsedIntent : "—"}</span>
              </p>
              <p>
                Industry: <span className="text-gray-700">{r.parsedIndustry ?? "—"}</span>
              </p>
              <p>
                Function: <span className="text-gray-700">{r.parsedFunction ?? "—"}</span>
              </p>
              <p>
                Company: <span className="text-gray-700">{r.parsedCompany ?? "—"}</span>
              </p>
            </div>
            {r.parseError && (
              <p className="mt-2 text-xs text-amber-600">⚠ Parsed via fallback heuristic: {r.parseError}</p>
            )}

            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Matches</p>
              {r.matches.length === 0 ? (
                <p className="text-xs text-gray-400">No matches generated.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {r.matches.map((m) => (
                    <span key={m.id} className="text-xs bg-gray-50 border border-gray-200 rounded-full px-2 py-1">
                      {m.source === "VOLUNTEER" ? "🙋" : `#${m.rank}`} {m.member.name} —{" "}
                      {MATCH_STATUS_LABELS[m.status] ?? m.status}
                      {m.source === "AI_MATCH" && ` (${Math.round(m.score * 100)}%)`}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <details className="mt-3">
              <summary className="text-xs text-gray-400 cursor-pointer">Raw AI output</summary>
              <pre className="text-xs bg-gray-900 text-gray-100 rounded-lg p-3 mt-2 overflow-x-auto">
                {r.parsedRaw ?? "null"}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
