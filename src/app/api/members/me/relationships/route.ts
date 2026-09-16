import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";

const schema = z.object({
  relationships: z.array(
    z.object({
      label: z.string().min(1).max(120),
      notes: z.string().max(300).optional(),
    })
  ),
});

// Replaces the member's full set of relationships with the submitted list —
// same pattern as /api/members/me/offerings.
export async function PUT(req: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.$transaction([
    prisma.relationship.deleteMany({ where: { memberId: member.id } }),
    prisma.relationship.createMany({
      data: parsed.data.relationships.map((r) => ({ ...r, memberId: member.id })),
    }),
  ]);

  const relationships = await prisma.relationship.findMany({ where: { memberId: member.id } });
  return NextResponse.json({ relationships });
}
