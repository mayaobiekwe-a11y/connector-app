import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getMemberPoints, badgeForPoints, nextBadge } from "@/lib/credit";
import { HELP_CATEGORY_LABELS, COMPENSATION_LABELS, OUTCOME_LABELS } from "@/lib/labels";
import StarRatingDisplay from "@/components/StarRatingDisplay";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const viewer = await getCurrentMember();
  if (!viewer) redirect("/login");

  const profileMember = await prisma.member.findUnique({
    where: { id: params.id },
    include: { offerings: true, community: true, relationships: true },
  });
  if (!profileMember) notFound();

  const [points, reviewsReceived] = await Promise.all([
    getMemberPoints(profileMember.id),
    prisma.review.findMany({
      where: { revieweeId: profileMember.id },
      include: { reviewer: true, request: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const badge = badgeForPoints(points);
  const upcoming = nextBadge(points);
  const isSelf = viewer.id === profileMember.id;

  const completed = reviewsReceived.filter((r) => r.outcome === "HELPED").length;
  const avgRating =
    reviewsReceived.filter((r) => r.rating).reduce((sum, r) => sum + (r.rating ?? 0), 0) /
    (reviewsReceived.filter((r) => r.rating).length || 1);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{profileMember.name}</h1>
            <p className="text-sm text-gray-500">
              {profileMember.title ?? "Member"} {profileMember.company ? `at ${profileMember.company}` : ""}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {profileMember.industry ?? ""} {profileMember.location ? `· ${profileMember.location}` : ""}
            </p>
            <p className="text-xs text-gray-400 mt-1">{profileMember.community.name}</p>
          </div>
          {isSelf && (
            <Link href="/profile/edit" className="btn-secondary shrink-0">
              Edit profile
            </Link>
          )}
        </div>
        {profileMember.bio && <p className="text-sm text-gray-600 mt-4">{profileMember.bio}</p>}
        <div className="flex flex-wrap gap-2 mt-4">
          {profileMember.openToRoles && (
            <span className="badge bg-green-50 text-green-700 border border-green-100">Open to new roles</span>
          )}
          {profileMember.openToGigWork && (
            <span className="badge bg-green-50 text-green-700 border border-green-100">Open to gig work</span>
          )}
          {profileMember.linkedinUrl && (
            <a
              href={profileMember.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="badge bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              LinkedIn ↗
            </a>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="badge bg-brand-50 text-brand-700 border border-brand-100 text-sm">{badge.label}</span>
            <p className="text-sm text-gray-500 mt-2">{points} points</p>
          </div>
          {upcoming && (
            <p className="text-xs text-gray-400 text-right">
              {upcoming.minPoints - points} points to <span className="font-medium">{upcoming.label}</span>
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-xl font-semibold text-gray-900">{completed}</p>
            <p className="text-gray-500">Completed helps</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-xl font-semibold text-gray-900">
              {reviewsReceived.some((r) => r.rating) ? avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-gray-500">Avg. rating</p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Willing to help with</h2>
        {profileMember.offerings.length === 0 ? (
          <p className="text-sm text-gray-500">No offerings listed yet.</p>
        ) : (
          <ul className="space-y-2">
            {profileMember.offerings.map((o) => (
              <li key={o.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                <div>
                  <p className="text-gray-800 font-medium">{HELP_CATEGORY_LABELS[o.category] ?? o.category}</p>
                  {o.notes && <p className="text-gray-500 text-xs">{o.notes}</p>}
                </div>
                <span className="badge bg-gray-100 text-gray-600">{COMPENSATION_LABELS[o.compensation] ?? o.compensation}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Has relationships at</h2>
        {profileMember.relationships.length === 0 ? (
          <p className="text-sm text-gray-500">None listed yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profileMember.relationships.map((r) => (
              <span key={r.id} className="badge bg-gray-100 text-gray-700" title={r.notes ?? undefined}>
                {r.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Help history</h2>
        {reviewsReceived.length === 0 ? (
          <p className="text-sm text-gray-500">No completed interactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {reviewsReceived.map((r) => (
              <li key={r.id} className="text-sm border-b border-gray-100 pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">
                    {OUTCOME_LABELS[r.outcome] ?? r.outcome} — for {r.reviewer.name}
                  </p>
                  {r.rating && <StarRatingDisplay rating={r.rating} />}
                </div>
                {r.comment && <p className="text-gray-500 mt-1">"{r.comment}"</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
