import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({ email: z.string().email(), secret: z.string().min(1) });

// One-time escape hatch to promote the very first admin: gated entirely by
// a secret env var rather than session/isAdmin, since there's no admin yet
// to grant that access through the normal UI. If ADMIN_BOOTSTRAP_SECRET
// isn't set, this route always refuses — safe by default in any
// environment that hasn't deliberately opted in.
export async function POST(req: Request) {
  const configuredSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!configuredSecret) {
    return NextResponse.json({ error: "Not enabled" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (parsed.data.secret !== configuredSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const member = await prisma.member.findUnique({ where: { email: parsed.data.email } });
  if (!member) return NextResponse.json({ error: "No account with that email" }, { status: 404 });

  await prisma.member.update({ where: { id: member.id }, data: { isAdmin: true } });

  return NextResponse.json({ ok: true, id: member.id });
}
