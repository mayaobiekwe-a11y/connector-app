import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";

// Deletes a pending quick-add lead (spam, a mistyped email, someone who
// shouldn't be followed up with). Scoped to the pending-lead shape so it
// can never delete a real account.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentMember();
  if (!admin || !admin.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = await prisma.member.deleteMany({
    where: { id: params.id, communityId: admin.communityId, claimedAt: null, passwordHash: null, visibleInDirectory: false },
  });
  if (result.count === 0) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
