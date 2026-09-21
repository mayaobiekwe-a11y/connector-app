import { prisma } from "./db";
import { parseAskRequest, rankMatches, type CandidateMember } from "./claude";
import type { HelpCategory, CompensationType } from "./enums";

const MATCH_LIMIT = 5;

// Runs the full "Ask" pipeline: parse the free-text request with Claude,
// rank the community directory against it, and persist the Request +
// resulting Match rows. Matched members are "notified" simply by the
// request showing up in their dashboard's incoming list.
export async function createRequestWithMatches(requesterId: string, communityId: string, rawText: string) {
  const { parsed, raw, usedFallback, error } = await parseAskRequest(rawText);

  const request = await prisma.request.create({
    data: {
      requesterId,
      communityId,
      rawText,
      parsedCompany: parsed.company,
      parsedIndustry: parsed.industry,
      parsedFunction: parsed.function,
      parsedIntent: parsed.intent,
      parsedSummary: parsed.summary,
      parsedRaw: raw,
      parseError: usedFallback ? error ?? "used heuristic fallback (no API key)" : null,
    },
  });

  const candidateMembers = await prisma.member.findMany({
    // Only match members who've opted into the directory/matching pool.
    where: { communityId, id: { not: requesterId }, visibleInDirectory: true },
    include: { offerings: true, relationships: true, sideHustles: true },
  });

  // Members with a monthlyCapacity who've already hit it (accepted matches
  // since the start of this calendar month) are excluded from new matches
  // so the busiest connectors don't get buried in requests.
  const overCapacity = new Set(await getMembersOverCapacity(candidateMembers));
  const eligibleMembers = candidateMembers.filter((m) => !overCapacity.has(m.id));

  const candidates: CandidateMember[] = eligibleMembers.map((m) => ({
    id: m.id,
    name: m.name,
    title: m.title,
    company: m.company,
    industry: m.industry,
    bio: m.bio,
    openToRoles: m.openToRoles,
    openToGigWork: m.openToGigWork,
    offerings: m.offerings.map((o) => ({
      category: o.category as HelpCategory,
      compensation: o.compensation as CompensationType,
      notes: o.notes,
    })),
    relationships: m.relationships.map((r) => ({ label: r.label, notes: r.notes })),
    sideHustles: m.sideHustles.map((s) => ({ name: s.name, description: s.description })),
  }));

  const { matches } = await rankMatches(rawText, parsed, candidates, MATCH_LIMIT);

  if (matches.length > 0) {
    await prisma.match.createMany({
      data: matches.map((m, idx) => ({
        requestId: request.id,
        memberId: m.memberId,
        rank: idx + 1,
        score: m.score,
        reason: m.reason,
        status: "PENDING",
      })),
    });
    await prisma.request.update({ where: { id: request.id }, data: { status: "MATCHED" } });
  }

  return prisma.request.findUniqueOrThrow({
    where: { id: request.id },
    include: { matches: { include: { member: true }, orderBy: { rank: "asc" } } },
  });
}

// Returns the ids of the given members who've already been accepted for
// as many (or more) requests as their monthlyCapacity this calendar month.
async function getMembersOverCapacity(
  members: { id: string; monthlyCapacity: number | null }[]
): Promise<string[]> {
  const capped = members.filter((m) => m.monthlyCapacity != null);
  if (capped.length === 0) return [];

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const counts = await prisma.match.groupBy({
    by: ["memberId"],
    where: {
      memberId: { in: capped.map((m) => m.id) },
      status: "ACCEPTED",
      createdAt: { gte: startOfMonth },
    },
    _count: { _all: true },
  });
  const countByMember = new Map(counts.map((c) => [c.memberId, c._count._all]));

  return capped.filter((m) => (countByMember.get(m.id) ?? 0) >= m.monthlyCapacity!).map((m) => m.id);
}
