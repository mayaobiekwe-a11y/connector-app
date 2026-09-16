import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const member = await prisma.member.findUnique({ where: { email: parsed.data.email } });
  if (!member) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const valid = await bcrypt.compare(parsed.data.password, member.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const session = await getSession();
  session.memberId = member.id;
  await session.save();

  return NextResponse.json({ id: member.id });
}
