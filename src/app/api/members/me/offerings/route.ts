import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { HELP_CATEGORIES, COMPENSATION_TYPES } from "@/lib/enums";

const schema = z.object({
  offerings: z.array(
    z.object({
      category: z.enum(HELP_CATEGORIES),
      compensation: z.enum(COMPENSATION_TYPES),
      notes: z.string().max(300).optional(),
    })
  ),
});

// Replaces the member's full set of offerings with the submitted list.
export async function PUT(req: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.$transaction([
    prisma.helpOffering.deleteMany({ where: { memberId: member.id } }),
    prisma.helpOffering.createMany({
      data: parsed.data.offerings.map((o) => ({ ...o, memberId: member.id })),
    }),
  ]);

  const offerings = await prisma.helpOffering.findMany({ where: { memberId: member.id } });
  return NextResponse.json({ offerings });
}
