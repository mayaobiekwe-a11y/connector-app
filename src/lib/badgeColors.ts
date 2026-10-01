// Standalone (no server-only deps) so client components can import it
// directly without pulling in credit.ts's Prisma dependency.
//
// Gives the top two reputation tiers their own color instead of every tier
// sharing the same brand-purple pill, so reaching "Super Connector" or
// "Highly Connected" visibly stands out wherever a badge is shown.
export function badgeColorClasses(tierKey: string): string {
  if (tierKey === "HIGHLY_CONNECTED") return "bg-gold-50 text-gold-700 border border-gold-200";
  if (tierKey === "SUPER_CONNECTOR") return "bg-accent-50 text-accent-700 border border-accent-200";
  return "bg-brand-50 text-brand-700 border border-brand-100";
}
