import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import ProfileEditForm from "@/components/ProfileEditForm";
import type { HelpCategory, CompensationType } from "@/lib/enums";

export default async function ProfileEditPage({
  searchParams,
}: {
  searchParams: { welcome?: string };
}) {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {searchParams.welcome && (
        <div className="card p-4 bg-brand-50 border-brand-100 text-sm text-brand-800">
          Welcome to {member.community.name}! Tell people what you're willing to help with so the
          matching AI can find you.
        </div>
      )}
      <h1 className="text-xl font-semibold">Edit your profile</h1>
      <ProfileEditForm
        member={{
          id: member.id,
          name: member.name,
          title: member.title ?? "",
          company: member.company ?? "",
          industry: member.industry ?? "",
          location: member.location ?? "",
          bio: member.bio ?? "",
          linkedinUrl: member.linkedinUrl ?? "",
          openToRoles: member.openToRoles,
          openToGigWork: member.openToGigWork,
        }}
        offerings={member.offerings.map((o) => ({
          category: o.category as HelpCategory,
          compensation: o.compensation as CompensationType,
          notes: o.notes ?? "",
        }))}
        relationships={member.relationships.map((r) => ({ label: r.label, notes: r.notes ?? "" }))}
      />
    </div>
  );
}
