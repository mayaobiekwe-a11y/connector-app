import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import LeadsReview, { type Lead } from "@/components/LeadsReview";

export default async function AdminLeadsPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (!member.isAdmin) {
    return <p className="text-sm text-gray-500">This page is only available to community admins.</p>;
  }

  const pending = await prisma.member.findMany({
    where: { communityId: member.communityId, claimedAt: null, passwordHash: null, visibleInDirectory: false },
    orderBy: { createdAt: "desc" },
  });

  const leads: Lead[] = pending.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    note: m.bio,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Leads</h1>
          <p className="text-sm text-gray-500">
            People who scanned your{" "}
            <Link href="/admin/qr" className="text-brand-600 underline">
              quick-add QR code
            </Link>
            . Approve to add them to the directory, or dismiss if it's not a real lead.
          </p>
        </div>
      </div>
      <LeadsReview leads={leads} />
    </div>
  );
}
