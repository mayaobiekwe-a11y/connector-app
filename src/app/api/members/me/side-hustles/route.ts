import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";

const schema = z.object({
  sideHustles: z.array(
    z.object({
      name: z.string().min(1).max(120),
      description: z.string().max(300).optional(),
      url: z.string().trim().url().max(500).optional().or(z.literal("")),
    })
  ),
});

// Replaces the member's full set of side hustles with the submitted list —
// same pattern as /api/members/me/offerings and /relationships.
export async function PUT(req: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.$transaction([
    prisma.sideHustle.deleteMany({ where: { memberId: member.id } }),
    prisma.sideHustle.createMany({
      data: parsed.data.sideHustles.map((s) => ({
        memberId: member.id,
        name: s.name,
        description: s.description,
        url: s.url || undefined,
      })),
    }),
  ]);

  const sideHustles = await prisma.sideHustle.findMany({ where: { memberId: member.id } });
  return NextResponse.json({ sideHustles });
}
