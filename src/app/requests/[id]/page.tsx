import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import StatusPill from "@/components/StatusPill";
import MatchRespondButtons from "@/components/MatchRespondButtons";
import ThreadView from "@/components/ThreadView";
import ReviewForm from "@/components/ReviewForm";
import StarRatingDisplay from "@/components/StarRatingDisplay";
import {
  REQUEST_STATUS_LABELS,
  MATCH_STATUS_LABELS,
  INTENT_LABELS,
  OUTCOME_LABELS,
} from "@/lib/labels";
import { isOpportunityIntent } from "@/lib/enums";

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const request = await prisma.request.findUnique({
    where: { id: params.id },
    include: {
      requester: true,
      matches: {
        include: {
          member: true,
          reviews: true,
          thread: { include: { messages: { include: { sender: true }, orderBy: { createdAt: "asc" } } } },
        },
        orderBy: { rank: "asc" },
      },
    },
  });
  if (!request) notFound();

  const isRequester = request.requesterId === member.id;
  const myMatch = request.matches.find((m) => m.memberId === member.id);
  const canView = isRequester || !!myMatch || member.isAdmin;
  const opportunity = isOpportunityIntent(request.parsedIntent);
  if (!canView) {
    return <p className="text-sm text-gray-500">You don't have access to this request.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-brand-700">
          ← Back to dashboard
        </Link>
      </div>

      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              {opportunity ? "Posted by" : "Asked by"}{" "}
              <span className="font-medium text-gray-700">{request.requester.name}</span>
              {opportunity && (
                <span className="badge bg-accent-50 text-accent-700 border border-accent-200">Opportunity</span>
              )}
            </p>
            <h1 className="text-lg font-semibold text-gray-900 mt-1">"{request.rawText}"</h1>
          </div>
          <StatusPill status={request.status} label={REQUEST_STATUS_LABELS[request.status] ?? request.status} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-400">Intent</dt>
            <dd className="text-gray-700">
              {request.parsedIntent ? INTENT_LABELS[request.parsedIntent] ?? request.parsedIntent : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400">Industry</dt>
            <dd className="text-gray-700">{request.parsedIndustry ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Function</dt>
            <dd className="text-gray-700">{request.parsedFunction ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Company</dt>
            <dd className="text-gray-700">{request.parsedCompany ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 mb-3">
          {request.matches.length} matched member{request.matches.length === 1 ? "" : "s"}
        </h2>
        <div className="space-y-4">
          {request.matches.map((m) => {
            const isMe = m.memberId === member.id;
            const review = m.reviews[0];
            const canRespond = isMe && m.status === "PENDING";
            const canChat = m.status === "ACCEPTED" && (isMe || isRequester);
            const canReview = isRequester && !review && (m.status === "ACCEPTED" || m.status === "PENDING");

            return (
              <div key={m.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/profile/${m.member.id}`} className="font-medium text-gray-900 hover:text-brand-700">
                      {m.member.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {m.member.title ?? "Member"} {m.member.company ? `at ${m.member.company}` : ""}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">{m.reason}</p>
                  </div>
                  <StatusPill status={m.status} label={MATCH_STATUS_LABELS[m.status] ?? m.status} />
                </div>

                {canRespond && <MatchRespondButtons matchId={m.id} opportunity={opportunity} />}

                {canChat && (
                  <ThreadView
                    matchId={m.id}
                    currentMemberId={member.id}
                    initialMessages={(m.thread?.messages ?? []).map((msg) => ({
                      ...msg,
                      createdAt: msg.createdAt.toISOString(),
                    }))}
                  />
                )}

                {review && (
                  <div className="mt-3 text-sm border-t border-gray-100 pt-3">
                    <p className="text-gray-700 font-medium">
                      Outcome: {OUTCOME_LABELS[review.outcome] ?? review.outcome}
                      {review.rating && (
                        <span className="ml-2">
                          <StarRatingDisplay rating={review.rating} />
                        </span>
                      )}
                    </p>
                    {review.comment && <p className="text-gray-500 mt-1">"{review.comment}"</p>}
                  </div>
                )}

                {canReview && <ReviewForm requestId={request.id} matchId={m.id} />}
              </div>
            );
          })}
          {request.matches.length === 0 && (
            <p className="text-sm text-gray-500">
              No strong matches were found in the network for this request yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
