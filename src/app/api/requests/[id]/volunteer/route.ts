import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { awardCredit } from "@/lib/credit";
import { awardAskCredits } from "@/lib/askCredits";

// Lets any community member volunteer to help with a request straight from
// the public feed, rather than waiting to be AI-matched. Since volunteering
// is an explicit "I've got this," the match is created already accepted and
// opens a thread immediately — no separate approval step.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const request = await prisma.request.findUnique({ where: { id: params.id } });
  if (!request || request.communityId !== member.communityId) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (request.requesterId === member.id) {
    return NextResponse.json({ error: "You can't volunteer for your own request" }, { status: 400 });
  }
  if (request.status === "COMPLETED" || request.status === "CLOSED") {
    return NextResponse.json({ error: "This request is no longer open" }, { status: 409 });
  }

  const existing = await prisma.match.findUnique({
    where: { requestId_memberId: { requestId: request.id, memberId: member.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You've already offered to help with this" }, { status: 409 });
  }

  const match = await prisma.match.create({
    data: {
      requestId: request.id,
      memberId: member.id,
      rank: 0,
      score: 1,
      reason: "Volunteered from the community feed.",
      status: "ACCEPTED",
      source: "VOLUNTEER",
      respondedAt: new Date(),
    },
  });

  await prisma.thread.create({ data: { matchId: match.id } });

  await awardCredit(member.id, "RESPONDED_TO_REQUEST", match.id);
  await awardAskCredits(member.id, "RESPONDED_TO_REQUEST", match.id);

  if (request.status === "OPEN" || request.status === "MATCHED") {
    await prisma.request.update({ where: { id: request.id }, data: { status: "IN_PROGRESS" } });
  }

  return NextResponse.json({ match });
}
