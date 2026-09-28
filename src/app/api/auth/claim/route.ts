import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { awardAskCredits } from "@/lib/askCredits";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6).max(100),
});

// Turns an imported, not-yet-claimed Member row into a real account: sets a
// password and logs them in, keeping the pre-loaded profile data as-is
// (they can edit it afterward from /profile/edit).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const member = await prisma.member.findUnique({ where: { claimToken: parsed.data.token } });
  if (!member) return NextResponse.json({ error: "This invite link isn't valid" }, { status: 404 });
  if (member.claimedAt) {
    return NextResponse.json({ error: "This account has already been claimed. Try logging in." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.member.update({
    where: { id: member.id },
    data: { passwordHash, claimedAt: new Date() },
  });

  await awardAskCredits(member.id, "SIGNUP_BONUS");

  const session = await getSession();
  session.memberId = member.id;
  await session.save();

  return NextResponse.json({ id: member.id });
}
