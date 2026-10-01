import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getPointsForMembers, badgeForPoints } from "@/lib/credit";
import DirectoryList, { type DirectoryMember } from "@/components/DirectoryList";
import TopConnectors, { type TopConnector } from "@/components/TopConnectors";
import { firstNameOnly } from "@/lib/displayName";

const TOP_CONNECTORS_LIMIT = 5;

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
    name: firstNameOnly(m.name),
    title: m.title,
    company: m.company,
    industry: m.industry,
    bio: m.bio,
    avatarUrl: m.avatarUrl,
    profileType: m.profileType,
    badgeLabel: badgeForPoints(points[m.id] ?? 0).label,
    relationships: m.relationships.map((r) => r.label),
    sideHustleNames: m.sideHustles.map((s) => s.name),
    claimed: Boolean(m.claimedAt) || Boolean(m.passwordHash),
  }));

  const topConnectors: TopConnector[] = [...members]
    .filter((m) => (points[m.id] ?? 0) > 0)
    .sort((a, b) => (points[b.id] ?? 0) - (points[a.id] ?? 0))
    .slice(0, TOP_CONNECTORS_LIMIT)
    .map((m) => ({
      id: m.id,
      name: firstNameOnly(m.name),
      avatarUrl: m.avatarUrl,
      badgeLabel: badgeForPoints(points[m.id] ?? 0).label,
    }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{member.community.name} directory</h1>
        <p className="text-sm text-gray-500">
          {directoryMembers.length} member{directoryMembers.length === 1 ? "" : "s"} visible in this
          community.
        </p>
      </div>
      {topConnectors.length > 0 && <TopConnectors members={topConnectors} />}
      <DirectoryList members={directoryMembers} />
    </div>
  );
}
