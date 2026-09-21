import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getPointsForMembers, badgeForPoints } from "@/lib/credit";
import DirectoryList, { type DirectoryMember } from "@/components/DirectoryList";

export default async function DirectoryPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const members = await prisma.member.findMany({
    where: { communityId: member.communityId, visibleInDirectory: true },
    include: { relationships: true, sideHustles: true },
    orderBy: { name: "asc" },
  });

  const points = await getPointsForMembers(members.map((m) => m.id));

  const directoryMembers: DirectoryMember[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    title: m.title,
    company: m.company,
    industry: m.industry,
    bio: m.bio,
    avatarUrl: m.avatarUrl,
    profileType: m.profileType,
    badgeLabel: badgeForPoints(points[m.id] ?? 0).label,
    relationships: m.relationships.map((r) => r.label),
    sideHustleNames: m.sideHustles.map((s) => s.name),
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{member.community.name} directory</h1>
        <p className="text-sm text-gray-500">
          {directoryMembers.length} member{directoryMembers.length === 1 ? "" : "s"} visible in this
          community.
        </p>
      </div>
      <DirectoryList members={directoryMembers} />
    </div>
  );
}
