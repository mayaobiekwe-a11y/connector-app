import { prisma } from "./db";

// MVP ships as one global network — every member joins the same community
// automatically, which matters here specifically because reach *beyond*
// any single group is the point (most members are job-searching and want
// more surface area, not a smaller silo). Private/separate networks are a
// real feature to add later — the schema already scopes everything under
// Community — just not exposed at signup yet.
const DEFAULT_COMMUNITY_SLUG = "global";
const DEFAULT_COMMUNITY_NAME = "The Network";

export async function getDefaultCommunityId(): Promise<string> {
  const community = await prisma.community.upsert({
    where: { slug: DEFAULT_COMMUNITY_SLUG },
    update: {},
    create: { name: DEFAULT_COMMUNITY_NAME, slug: DEFAULT_COMMUNITY_SLUG },
  });
  return community.id;
}
