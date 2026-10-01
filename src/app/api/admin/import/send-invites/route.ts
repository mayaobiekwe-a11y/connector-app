import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import { sendClaimInviteEmail } from "@/lib/email";

// Emails a claim link to every imported member who hasn't been invited yet.
// Separate from the import step itself so an admin can review what got
// imported before blasting real people's inboxes. visibleInDirectory: true
// also excludes quick-add leads (see /api/public/quick-join) that haven't
// been approved yet at /admin/leads — approving one flips it to true, which
// is what makes it eligible for the next invite batch here.
export async function POST() {
  const admin = await getCurrentMember();
  if (!admin || !admin.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pending = await prisma.member.findMany({
    where: {
      communityId: admin.communityId,
      claimedAt: null,
      inviteSentAt: null,
      claimToken: { not: null },
      visibleInDirectory: true,
    },
  });

  await Promise.all(pending.map((m) => sendClaimInviteEmail(m.email, m.name, m.claimToken!)));

  await prisma.member.updateMany({
    where: { id: { in: pending.map((m) => m.id) } },
    data: { inviteSentAt: new Date() },
  });

  return NextResponse.json({ sent: pending.length });
}
