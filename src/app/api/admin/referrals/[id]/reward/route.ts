import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";

const schema = z.object({ note: z.string().trim().max(200).optional() });

// Marks a referral reward as actually fulfilled — an admin sent the gift
// card or granted the free premium month outside the app, same "no real
// payment processing" pattern as everywhere else in this prototype.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentMember();
  if (!admin || !admin.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const result = await prisma.referralReward.updateMany({
    where: { id: params.id, status: "PENDING" },
    data: { status: "REWARDED", rewardedAt: new Date(), note: parsed.data.note || undefined },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found or already rewarded" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
