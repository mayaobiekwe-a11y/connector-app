import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import StatusPill from "@/components/StatusPill";
import VolunteerButton from "@/components/VolunteerButton";
import { REQUEST_STATUS_LABELS, INTENT_LABELS, MATCH_STATUS_LABELS } from "@/lib/labels";
import { isOpportunityIntent } from "@/lib/enums";
import { firstNameOnly } from "@/lib/displayName";

export default async function FeedPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const requests = await prisma.request.findMany({
    where: { communityId: member.communityId, status: { in: ["OPEN", "MATCHED", "IN_PROGRESS"] } },
    include: {
      requester: true,
      matches: { where: { memberId: member.id } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <span className="eyebrow">Live</span>
        <h1 className="text-2xl font-semibold text-gray-900 mt-1">Community feed</h1>
        <p className="text-sm text-gray-500 mt-1">
          Every open ask in {member.community.name} — not just the ones Mobi privately matched you
          to. See something you can help with? Jump in.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
          No open asks right now.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const isMine = r.requesterId === member.id;
            const myMatch = r.matches[0];
            const opportunity = isOpportunityIntent(r.parsedIntent);

            return (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                      {isMine ? (
                        <span className="badge bg-gray-100 text-gray-600">Your ask</span>
                      ) : (
                        <>
                          From <span className="font-medium text-gray-700">{firstNameOnly(r.requester.name)}</span>
                        </>
                      )}
                      {opportunity && (
                        <span className="badge bg-accent-50 text-accent-700 border border-accent-200">
                          Opportunity
                        </span>
                      )}
                    </p>
                    <Link href={`/requests/${r.id}`} className="font-medium text-gray-900 hover:text-brand-700">
                      "{r.rawText}"
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {r.parsedIntent ? INTENT_LABELS[r.parsedIntent] ?? r.parsedIntent : "Parsing..."}
                    </p>
                  </div>
                  <StatusPill status={r.status} label={REQUEST_STATUS_LABELS[r.status] ?? r.status} />
                </div>

                <div className="mt-3">
                  {isMine ? (
                    <Link href={`/requests/${r.id}`} className="text-sm text-brand-700 font-medium">
                      View your ask →
                    </Link>
                  ) : myMatch ? (
                    <Link href={`/requests/${r.id}`} className="text-sm text-brand-700 font-medium">
                      {myMatch.status === "ACCEPTED" ? "Open conversation" : "You're already involved"} →
                      <span className="ml-2 text-xs text-gray-400 font-normal">
                        ({MATCH_STATUS_LABELS[myMatch.status] ?? myMatch.status})
                      </span>
                    </Link>
                  ) : (
                    <VolunteerButton requestId={r.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
