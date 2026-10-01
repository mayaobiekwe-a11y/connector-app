import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";

// Promotes a pending quick-add lead (see /api/public/quick-join) into the
// directory. Scoped to the pending-lead shape (never claimed, never
// approved) so this can't be used to toggle visibility on an unrelated
// member who's just privately claimed.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentMember();
  if (!admin || !admin.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = await prisma.member.updateMany({
    where: { id: params.id, communityId: admin.communityId, claimedAt: null, passwordHash: null, visibleInDirectory: false },
    data: { visibleInDirectory: true },
  });
  if (result.count === 0) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
