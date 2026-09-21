import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import AskBar from "@/components/AskBar";
import StatusPill from "@/components/StatusPill";
import MatchRespondButtons from "@/components/MatchRespondButtons";
import { REQUEST_STATUS_LABELS, MATCH_STATUS_LABELS, INTENT_LABELS } from "@/lib/labels";
import { isOpportunityIntent } from "@/lib/enums";

export default async function DashboardPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const [myRequests, incomingMatches] = await Promise.all([
    prisma.request.findMany({
      where: { requesterId: member.id },
      include: { matches: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.match.findMany({
      where: { memberId: member.id },
      include: { request: { include: { requester: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <span className="eyebrow">Get started</span>
        <h1 className="text-2xl font-semibold text-gray-900 mt-1 mb-3">Ask your network</h1>
        <AskBar />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Requests for you
          {incomingMatches.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">({incomingMatches.length})</span>
          )}
        </h2>
        {incomingMatches.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            No one has requested your help yet.
          </div>
        ) : (
          <div className="space-y-3">
            {incomingMatches.map((m) => {
              const opportunity = isOpportunityIntent(m.request.parsedIntent);
              return (
                <div key={m.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        From <span className="font-medium text-gray-700">{m.request.requester.name}</span>
                        {opportunity && (
                          <span className="badge bg-accent-50 text-accent-700 border border-accent-200">
                            Opportunity
                          </span>
                        )}
                      </p>
                      <Link href={`/requests/${m.requestId}`} className="font-medium text-gray-900 hover:text-brand-700">
                        "{m.request.rawText}"
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">{m.reason}</p>
                    </div>
                    <StatusPill status={m.status} label={MATCH_STATUS_LABELS[m.status] ?? m.status} />
                  </div>
                  {m.status === "PENDING" && <MatchRespondButtons matchId={m.id} opportunity={opportunity} />}
                  {m.status === "ACCEPTED" && (
                    <Link href={`/requests/${m.requestId}`} className="text-sm text-brand-700 font-medium mt-2 inline-block">
                      Open conversation →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Your asks
          {myRequests.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">({myRequests.length})</span>
          )}
        </h2>
        {myRequests.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            You haven't asked for anything yet — try the box above.
          </div>
        ) : (
          <div className="space-y-3">
            {myRequests.map((r) => (
              <Link key={r.id} href={`/requests/${r.id}`} className="card p-4 flex items-start justify-between gap-3 hover:border-brand-300 block">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">"{r.rawText}"</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {r.parsedIntent ? INTENT_LABELS[r.parsedIntent] ?? r.parsedIntent : "Parsing..."} ·{" "}
                    {r.matches.length} match{r.matches.length === 1 ? "" : "es"}
                  </p>
                </div>
                <StatusPill status={r.status} label={REQUEST_STATUS_LABELS[r.status] ?? r.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
