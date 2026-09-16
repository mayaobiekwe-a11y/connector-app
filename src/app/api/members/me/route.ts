import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  title: z.string().max(100).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
});

export async function PATCH(req: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.member.update({ where: { id: member.id }, data: parsed.data });
  return NextResponse.json({ member: updated });
}
