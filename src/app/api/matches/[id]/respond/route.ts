import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { awardCredit } from "@/lib/credit";

const schema = z.object({ action: z.enum(["accept", "decline"]) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (match.memberId !== member.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (match.status !== "PENDING") {
    return NextResponse.json({ error: "This request has already been responded to" }, { status: 409 });
  }

  const newStatus = parsed.data.action === "accept" ? "ACCEPTED" : "DECLINED";

  await prisma.match.update({
    where: { id: match.id },
    data: { status: newStatus, respondedAt: new Date() },
  });

  await awardCredit(member.id, "RESPONDED_TO_REQUEST", match.id);

  if (newStatus === "ACCEPTED") {
    await prisma.thread.upsert({
      where: { matchId: match.id },
      update: {},
      create: { matchId: match.id },
    });
    await prisma.request.update({ where: { id: match.requestId }, data: { status: "IN_PROGRESS" } });
  }

  return NextResponse.json({ ok: true });
}
