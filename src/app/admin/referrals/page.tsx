import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import ReferralRewardsList, { type ReferralRewardRow } from "@/components/ReferralRewardsList";
import { MAX_REWARDS_PER_REFERRER } from "@/lib/referrals";

export default async function AdminReferralsPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (!member.isAdmin) {
    return <p className="text-sm text-gray-500">This page is only available to community admins.</p>;
  }

  const rewards = await prisma.referralReward.findMany({
    where: { referrer: { communityId: member.communityId } },
    include: { referrer: true, referee: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const rows: ReferralRewardRow[] = rewards.map((r) => ({
    id: r.id,
    referrerName: r.referrer.name,
    referrerEmail: r.referrer.email,
    refereeName: r.referee.name,
    refereeEmail: r.referee.email,
    status: r.status,
    note: r.note,
    createdAt: r.createdAt.toISOString(),
    rewardedAt: r.rewardedAt?.toISOString() ?? null,
  }));

  const pendingCount = rows.filter((r) => r.status === "PENDING").length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Referral rewards</h1>
        <p className="text-sm text-gray-500">
          A member earns a reward (a $10-15 gift card, or a free month of a future premium tier)
          when someone they invited signs up and posts their first ask or accepts their first
          match. Capped at {MAX_REWARDS_PER_REFERRER} per person so it can't turn into
          spam-inviting. Nothing here sends a real payment — mark one rewarded once you've
          actually sent it.
          {pendingCount > 0 && (
            <span className="block mt-1 font-medium text-amber-700">
              {pendingCount} waiting on you.
            </span>
          )}
        </p>
      </div>
      <ReferralRewardsList rewards={rows} />
    </div>
  );
}
