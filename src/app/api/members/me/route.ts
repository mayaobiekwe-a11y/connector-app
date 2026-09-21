import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { PROFILE_TYPES } from "@/lib/enums";

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  title: z.string().max(100).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  linkedinUrl: z.string().trim().url().max(300).optional().nullable().or(z.literal("")),
  avatarUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
  openToRoles: z.boolean().optional(),
  openToGigWork: z.boolean().optional(),
  profileType: z.enum(PROFILE_TYPES).optional(),
  monthlyCapacity: z.number().int().min(0).max(1000).optional().nullable(),
  visibleInDirectory: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data: typeof parsed.data & { subscriptionStatus?: string } = { ...parsed.data };
  if (data.linkedinUrl === "") data.linkedinUrl = null;
  if (data.avatarUrl === "") data.avatarUrl = null;

  // No real billing in this prototype: switching into Service Provider
  // starts an active subscription; switching out clears it.
  if (data.profileType === "SERVICE_PROVIDER" && member.profileType !== "SERVICE_PROVIDER") {
    data.subscriptionStatus = "ACTIVE";
  } else if (data.profileType === "GENERAL" && member.profileType !== "GENERAL") {
    data.subscriptionStatus = "NONE";
  }

  const updated = await prisma.member.update({ where: { id: member.id }, data });
  return NextResponse.json({ member: updated });
}
