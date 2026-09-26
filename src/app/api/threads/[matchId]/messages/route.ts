import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { sendNewMessageEmail } from "@/lib/email";

async function authorizeThread(matchId: string, memberId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { request: { include: { requester: true } }, member: true },
  });
  if (!match) return null;
  const isParticipant = match.memberId === memberId || match.request.requesterId === memberId;
  return isParticipant ? match : null;
}

export async function GET(_req: Request, { params }: { params: { matchId: string } }) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const match = await authorizeThread(params.matchId, member.id);
  if (!match) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const thread = await prisma.thread.findUnique({
    where: { matchId: params.matchId },
    include: { messages: { include: { sender: true }, orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ messages: thread?.messages ?? [] });
}

const schema = z.object({ body: z.string().min(1).max(2000) });

export async function POST(req: Request, { params }: { params: { matchId: string } }) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const match = await authorizeThread(params.matchId, member.id);
  if (!match) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (match.status !== "ACCEPTED") {
    return NextResponse.json({ error: "This match hasn't been accepted yet" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });

  const thread = await prisma.thread.upsert({
    where: { matchId: params.matchId },
    update: {},
    create: { matchId: params.matchId },
  });

  const message = await prisma.message.create({
    data: { threadId: thread.id, senderId: member.id, body: parsed.data.body },
    include: { sender: true },
  });

  const recipient = member.id === match.memberId ? match.request.requester : match.member;
  await sendNewMessageEmail(recipient.email, recipient.name, member.name, match.requestId);

  return NextResponse.json({ message });
}
