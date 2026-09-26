import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { awardCredit, reasonForRating } from "@/lib/credit";
import { awardAskCredits } from "@/lib/askCredits";
import { sendReviewReceivedEmail } from "@/lib/email";
import { REQUEST_OUTCOMES } from "@/lib/enums";

const schema = z.object({
  matchId: z.string(),
  outcome: z.enum(REQUEST_OUTCOMES),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const request = await prisma.request.findUnique({ where: { id: params.id } });
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (request.requesterId !== member.id) {
    return NextResponse.json({ error: "Only the requester can log an outcome" }, { status: 403 });
  }

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
    include: { member: true },
  });
  if (!match || match.requestId !== request.id) {
    return NextResponse.json({ error: "Match not found for this request" }, { status: 404 });
  }

  const existing = await prisma.review.findUnique({ where: { matchId: match.id } });
  if (existing) return NextResponse.json({ error: "This match has already been reviewed" }, { status: 409 });

  const { outcome, rating, comment } = parsed.data;
  if (outcome === "HELPED" && !rating) {
    return NextResponse.json({ error: "A star rating is required when marking as helped" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      requestId: request.id,
      matchId: match.id,
      reviewerId: member.id,
      revieweeId: match.memberId,
      outcome,
      rating: outcome === "HELPED" ? rating : null,
      comment,
    },
  });

  if (outcome === "HELPED" && rating) {
    await awardCredit(match.memberId, reasonForRating(rating), match.id);
    if (rating >= 4) {
      await awardAskCredits(match.memberId, "COMPLETED_POSITIVE", match.id);
    }
  } else if (outcome === "DIDNT_WORK_OUT") {
    await awardCredit(match.memberId, "DIDNT_WORK_OUT", match.id);
  }
  // NO_RESPONSE earns no credit for the matched member.

  await prisma.request.update({ where: { id: request.id }, data: { status: "COMPLETED" } });

  await sendReviewReceivedEmail(
    match.member.email,
    match.member.name,
    outcome === "HELPED" ? rating ?? null : null,
    request.id
  );

  return NextResponse.json({ review });
}
