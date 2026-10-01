import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getDefaultCommunityId } from "@/lib/community";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  note: z.string().trim().max(300).optional(),
});

// Public, unauthenticated — this is the landing page for the QR code admins
// show people in person (see /join and /admin/qr). No password, no
// relationships required: it just captures a lead as an unclaimed Member,
// same shape as a bulk CSV import, except visibleInDirectory starts false
// so a stranger scanning a QR code can't immediately show up in the
// directory — an admin reviews and approves it first (see /admin/leads).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a name and a valid email." }, { status: 400 });
  }
  const { name, note } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.member.findUnique({ where: { email } });
  if (existing) {
    // Already a real account, or already a pending lead/import — either
    // way, nothing to create, and we don't want to leak which case it is.
    return NextResponse.json({ ok: true });
  }

  const communityId = await getDefaultCommunityId();
  await prisma.member.create({
    data: {
      email,
      name,
      bio: note || null,
      communityId,
      visibleInDirectory: false,
      claimToken: crypto.randomBytes(24).toString("hex"),
    },
  });

  return NextResponse.json({ ok: true });
}
