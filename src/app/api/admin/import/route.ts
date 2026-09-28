import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";

const rowSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  linkedinUrl: z.string().max(300).optional(),
  // Semicolon-separated freeform text (commas are too likely to appear
  // inside a single relationship/side-hustle label, e.g. "Google, NYC").
  relationships: z.string().max(2000).optional(),
  sideHustles: z.string().max(2000).optional(),
});

const schema = z.object({ rows: z.array(rowSchema).max(2000) });

function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Bulk-creates Member rows with no password and a claim token, for
// pre-loading an existing community's data so the directory isn't empty on
// day one. Each row becomes a real account once its owner claims it via
// /claim/[token] (see the send-invites route for emailing that link out).
export async function POST(req: Request) {
  const admin = await getCurrentMember();
  if (!admin || !admin.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of parsed.data.rows) {
    const email = row.email.trim().toLowerCase();
    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      skipped++;
      continue;
    }

    try {
      const relationships = splitList(row.relationships)
        .slice(0, 20)
        .map((label) => ({ label }));
      const sideHustles = splitList(row.sideHustles)
        .slice(0, 10)
        .map((name) => ({ name }));

      await prisma.member.create({
        data: {
          email,
          name: row.name.trim(),
          title: row.title || null,
          company: row.company || null,
          industry: row.industry || null,
          location: row.location || null,
          bio: row.bio || null,
          linkedinUrl: row.linkedinUrl || null,
          communityId: admin.communityId,
          visibleInDirectory: true,
          claimToken: crypto.randomBytes(24).toString("hex"),
          relationships: relationships.length ? { create: relationships } : undefined,
          sideHustles: sideHustles.length ? { create: sideHustles } : undefined,
        },
      });
      created++;
    } catch {
      errors.push(row.email);
    }
  }

  return NextResponse.json({ created, skipped, errors });
}
