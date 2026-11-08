import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const member = await prisma.member.findUnique({ where: { email: parsed.data.email } });

  // Same response whether or not the email exists, or has a password yet
  // (an imported member who hasn't claimed their account) — don't let this
  // endpoint be used to probe who's a member.
  if (member && member.passwordHash) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    await prisma.member.update({
      where: { id: member.id },
      data: { resetToken, resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });
    await sendPasswordResetEmail(member.email, member.name, resetToken);
  }

  return NextResponse.json({ ok: true });
}
