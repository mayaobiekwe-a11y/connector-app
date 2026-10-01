import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import { NEED_CATEGORIES } from "@/lib/enums";
import { NEED_CATEGORY_LABELS } from "@/lib/labels";

export default async function ResourcesPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const resources = await prisma.resource.findMany({
    where: { communityId: member.communityId },
    orderBy: { name: "asc" },
  });

  const byCategory = NEED_CATEGORIES.map((category) => ({
    category,
    items: resources.filter((r) => r.categories.includes(category)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Resources</h1>
        <p className="text-sm text-gray-500">
          Orgs and hotlines you can reach directly, no ask required.
        </p>
      </div>

      {byCategory.length === 0 && (
        <p className="text-sm text-gray-500">No resources added yet.</p>
      )}

      {byCategory.map(({ category, items }) => (
        <div key={category}>
          <h2 className="text-sm font-semibold text-gray-900 mb-2">{NEED_CATEGORY_LABELS[category]}</h2>
          <div className="space-y-3">
            {items.map((r) => (
              <div key={r.id} className="card p-4">
                <p className="font-medium text-gray-900">{r.name}</p>
                {r.description && <p className="text-sm text-gray-600 mt-1">{r.description}</p>}
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">
                      Visit site
                    </a>
                  )}
                  {r.phone && (
                    <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="text-brand-700 underline">
                      {r.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
