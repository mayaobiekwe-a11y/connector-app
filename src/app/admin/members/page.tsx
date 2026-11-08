import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getPointsForMembers } from "@/lib/credit";

export default async function AdminMembersPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (!member.isAdmin) {
    return <p className="text-sm text-gray-500">This page is only available to community admins.</p>;
  }

  const members = await prisma.member.findMany({
    where: { communityId: member.communityId },
    orderBy: { createdAt: "desc" },
  });
  const points = await getPointsForMembers(members.map((m) => m.id));

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold">
          Members <span className="text-gray-400 font-normal">({members.length})</span>
        </h1>
        <p className="text-sm text-gray-500">Everyone in {member.community.name}, newest first.</p>
      </div>

      <div className="space-y-2">
        {members.map((m) => (
          <Link
            key={m.id}
            href={`/profile/${m.id}`}
            className="card p-4 flex items-center justify-between gap-3 hover:border-brand-300 block"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900 flex items-center gap-2">
                {m.name}
                {m.isAdmin && <span className="badge bg-brand-50 text-brand-700 border border-brand-100">Admin</span>}
                {!m.claimedAt && !m.passwordHash && (
                  <span className="badge bg-amber-50 text-amber-700 border border-amber-200">Unclaimed</span>
                )}
              </p>
              <p className="text-xs text-gray-500 truncate">{m.email}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500 mt-1">{points[m.id] ?? 0} pts</p>
            </div>
          </Link>
        ))}
        {members.length === 0 && <p className="text-sm text-gray-500">No members yet.</p>}
      </div>
    </div>
  );
}
