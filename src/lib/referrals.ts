import { prisma } from "./db";

// "A few per person" — caps how many reward rows a single referrer can
// rack up, so sharing a link can't turn into spam-inviting for free gift
// cards. One constant to tune.
export const MAX_REWARDS_PER_REFERRER = 5;

// Idempotent: call this from every place an invitee could "activate" (post
// their first ask, accept their first match, volunteer for one) — whichever
// happens first creates the reward row, and later calls just no-op because
// of the (referrerId, refereeId) unique constraint. No "is this their
// first X" check needed here as a result.
export async function maybeCreateReferralReward(refereeId: string): Promise<void> {
  const referee = await prisma.member.findUnique({
    where: { id: refereeId },
    select: { referredByMemberId: true },
  });
  if (!referee?.referredByMemberId) return;

  const referrerId = referee.referredByMemberId;

  const existing = await prisma.referralReward.findUnique({
    where: { referrerId_refereeId: { referrerId, refereeId } },
  });
  if (existing) return;

  const countForReferrer = await prisma.referralReward.count({ where: { referrerId } });
  if (countForReferrer >= MAX_REWARDS_PER_REFERRER) return;

  await prisma.referralReward.create({ data: { referrerId, refereeId } });
}
