import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { NEED_CATEGORIES } from "@/lib/enums";

const schema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(500).optional(),
  url: z.string().trim().url().max(500).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  categories: z.array(z.enum(NEED_CATEGORIES)).max(NEED_CATEGORIES.length),
});

export async function POST(req: Request) {
  const admin = await getCurrentMember();
  if (!admin || !admin.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const resource = await prisma.resource.create({
    data: {
      communityId: admin.communityId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      url: parsed.data.url || null,
      phone: parsed.data.phone || null,
      categories: parsed.data.categories,
    },
  });

  return NextResponse.json({ resource });
}
