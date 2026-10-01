import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import ResourceForm from "@/components/ResourceForm";
import ResourceList, { type AdminResource } from "@/components/ResourceList";

export default async function AdminResourcesPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (!member.isAdmin) {
    return <p className="text-sm text-gray-500">This page is only available to community admins.</p>;
  }

  const resources = await prisma.resource.findMany({
    where: { communityId: member.communityId },
    orderBy: { createdAt: "desc" },
  });

  const list: AdminResource[] = resources.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    url: r.url,
    phone: r.phone,
    categories: r.categories,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Resources</h1>
        <p className="text-sm text-gray-500">
          Orgs and hotlines members can reach directly — mental health, sexual assault, workplace
          harassment, and anything else that shouldn't wait on a warm intro. Shown to every member
          at <code className="text-xs">/resources</code>, grouped by category.
        </p>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Add a resource</h2>
        <ResourceForm />
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 mb-3">All resources ({list.length})</h2>
        <ResourceList resources={list} />
      </div>
    </div>
  );
}
