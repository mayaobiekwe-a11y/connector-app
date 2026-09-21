import type { CreditReason } from "./enums";
import { prisma } from "./db";

// Points awarded per event. Kept simple and centralized so the scoring
// rules are easy to tune without touching call sites.
export const POINTS: Record<CreditReason, number> = {
  RESPONDED_TO_REQUEST: 3,
  COMPLETED_POSITIVE: 15, // rating 4-5
  COMPLETED_NEUTRAL: 7, // rating 3
  COMPLETED_LOW: 2, // rating 1-2
  DIDNT_WORK_OUT: 1,
};

export interface BadgeTier {
  key: string;
  label: string;
  minPoints: number;
}

// Ordered ascending; a member's tier is the highest one they qualify for.
export const BADGE_TIERS: BadgeTier[] = [
  { key: "NEWCOMER", label: "Newcomer", minPoints: 0 },
  { key: "ACTIVE_HELPER", label: "Active Helper", minPoints: 15 },
  { key: "TRUSTED_CONNECTOR", label: "Trusted Connector", minPoints: 40 },
  { key: "SUPER_CONNECTOR", label: "Super Connector", minPoints: 80 },
];

export function badgeForPoints(points: number): BadgeTier {
  let tier = BADGE_TIERS[0];
  for (const t of BADGE_TIERS) {
    if (points >= t.minPoints) tier = t;
  }
  return tier;
}

export function nextBadge(points: number): BadgeTier | null {
  return BADGE_TIERS.find((t) => t.minPoints > points) ?? null;
}

export async function awardCredit(
  memberId: string,
  reason: CreditReason,
  refId?: string
) {
  return prisma.creditEntry.create({
    data: { memberId, reason, refId, points: POINTS[reason] },
  });
}

export async function getMemberPoints(memberId: string): Promise<number> {
  const agg = await prisma.creditEntry.aggregate({
    where: { memberId },
    _sum: { points: true },
  });
  return agg._sum.points ?? 0;
}

// Bulk variant for listing pages (directory, admin) so they don't do one
// aggregate query per member.
export async function getPointsForMembers(memberIds: string[]): Promise<Record<string, number>> {
  if (memberIds.length === 0) return {};
  const groups = await prisma.creditEntry.groupBy({
    by: ["memberId"],
    where: { memberId: { in: memberIds } },
    _sum: { points: true },
  });
  const result: Record<string, number> = {};
  for (const id of memberIds) result[id] = 0;
  for (const g of groups) result[g.memberId] = g._sum.points ?? 0;
  return result;
}

export function reasonForRating(rating: number): CreditReason {
  if (rating >= 4) return "COMPLETED_POSITIVE";
  if (rating === 3) return "COMPLETED_NEUTRAL";
  return "COMPLETED_LOW";
}
