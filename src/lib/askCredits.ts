import type { AskCreditReason } from "./enums";
import { prisma } from "./db";

// Spendable currency for making an Ask — separate from the permanent
// reputation points in credit.ts. Without this, a member could post an
// unlimited number of requests; this caps that and rewards helping others
// with the ability to ask for help yourself.
export const STARTING_ASK_CREDITS = 3;
export const ASK_COST = 1;
export const MONTHLY_STIPEND = 2;

export const ASK_CREDIT_AMOUNTS: Record<AskCreditReason, number> = {
  SIGNUP_BONUS: STARTING_ASK_CREDITS,
  MONTHLY_REFRESH: MONTHLY_STIPEND,
  ASK_SPENT: -ASK_COST,
  RESPONDED_TO_REQUEST: 1,
  COMPLETED_POSITIVE: 2,
};

export async function awardAskCredits(memberId: string, reason: AskCreditReason, refId?: string) {
  return prisma.askCreditEntry.create({
    data: { memberId, reason, refId, amount: ASK_CREDIT_AMOUNTS[reason] },
  });
}

export async function getAskCreditBalance(memberId: string): Promise<number> {
  const agg = await prisma.askCreditEntry.aggregate({
    where: { memberId },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
}

// Grants a monthly stipend the first time a member is checked in a given
// calendar month, so the economy doesn't need a cron job to stay alive.
// Skips the member's signup month, since the signup bonus already covers it
// — otherwise everyone would get a bonus top-up the moment they first load
// the dashboard, on top of their signup credits.
export async function ensureMonthlyRefresh(memberId: string): Promise<void> {
  const now = new Date();
  const currentMonth = monthKey(now);

  const [signup, lastRefresh] = await Promise.all([
    prisma.askCreditEntry.findFirst({
      where: { memberId, reason: "SIGNUP_BONUS" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.askCreditEntry.findFirst({
      where: { memberId, reason: "MONTHLY_REFRESH" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (signup && monthKey(signup.createdAt) === currentMonth) return;

  const alreadyRefreshedThisMonth = lastRefresh && monthKey(lastRefresh.createdAt) === currentMonth;
  if (!alreadyRefreshedThisMonth) {
    await awardAskCredits(memberId, "MONTHLY_REFRESH");
  }
}
