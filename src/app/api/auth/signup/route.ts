import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { slugify } from "@/lib/slugify";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  communityId: z.string().optional(),
  newCommunityName: z.string().max(100).optional(),
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
      communityId,
    },
  });

  const session = await getSession();
  session.memberId = member.id;
  await session.save();

  return NextResponse.json({ id: member.id });
}
