import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { slugify } from "@/lib/slugify";
import { PROFILE_TYPES } from "@/lib/enums";
import { awardAskCredits } from "@/lib/askCredits";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  linkedinUrl: z.string().trim().url().max(300).optional().or(z.literal("")),
  avatarUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  profileType: z.enum(PROFILE_TYPES).optional(),
  monthlyCapacity: z.number().int().min(0).max(1000).optional(),
  visibleInDirectory: z.boolean().optional(),
  communityId: z.string().optional(),
  newCommunityName: z.string().max(100).optional(),
  relationships: z
    .array(z.object({ label: z.string().min(1).max(120), notes: z.string().max(300).optional() }))
    .max(20)
    .optional(),
  sideHustles: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        description: z.string().max(300).optional(),
        url: z.string().trim().url().max(500).optional().or(z.literal("")),
      })
    )
    .max(10)
    .optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (!data.communityId && !data.newCommunityName) {
    return NextResponse.json({ error: "Select or create a community" }, { status: 400 });
  }

  const existing = await prisma.member.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  let communityId = data.communityId;
  if (!communityId && data.newCommunityName) {
    const slug = slugify(data.newCommunityName) || `network-${Date.now()}`;
    const community = await prisma.community.upsert({
      where: { slug },
      update: {},
      create: { name: data.newCommunityName, slug },
    });
    communityId = community.id;
  }
  if (!communityId) {
    return NextResponse.json({ error: "Invalid community" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const profileType = data.profileType ?? "GENERAL";
  const member = await prisma.member.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      title: data.title,
      company: data.company,
      industry: data.industry,
      location: data.location,
      bio: data.bio,
      linkedinUrl: data.linkedinUrl || null,
      avatarUrl: data.avatarUrl || null,
      profileType,
      // No real billing in this prototype: a Service Provider's subscription
      // starts "ACTIVE" on signup rather than gating on payment.
      subscriptionStatus: profileType === "SERVICE_PROVIDER" ? "ACTIVE" : "NONE",
      monthlyCapacity: data.monthlyCapacity,
      visibleInDirectory: data.visibleInDirectory ?? true,
      communityId,
      relationships: data.relationships?.length
        ? { create: data.relationships.filter((r) => r.label.trim()) }
        : undefined,
      sideHustles: data.sideHustles?.length
        ? {
            create: data.sideHustles
              .filter((s) => s.name.trim())
              .map((s) => ({ name: s.name, description: s.description, url: s.url || undefined })),
          }
        : undefined,
    },
  });

  await awardAskCredits(member.id, "SIGNUP_BONUS");

  const session = await getSession();
  session.memberId = member.id;
  await session.save();

  return NextResponse.json({ id: member.id });
}
