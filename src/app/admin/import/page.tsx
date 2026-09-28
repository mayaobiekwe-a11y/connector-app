import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import { prisma } from "@/lib/db";
import ImportForm from "@/components/ImportForm";
import SendInvitesButton from "@/components/SendInvitesButton";

export default async function AdminImportPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (!member.isAdmin) {
    return <p className="text-sm text-gray-500">This page is only available to community admins.</p>;
  }

  const [claimed, unclaimed, invited] = await Promise.all([
    prisma.member.count({ where: { communityId: member.communityId, claimedAt: { not: null } } }),
    prisma.member.count({ where: { communityId: member.communityId, claimedAt: null } }),
    prisma.member.count({
      where: { communityId: member.communityId, claimedAt: null, inviteSentAt: { not: null } },
    }),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Import members</h1>
        <p className="text-sm text-gray-500">
          Bulk-add profiles from an existing community (e.g. a CSV export from Airtable or Google
          Forms). Each imported profile shows up in the directory right away and can be matched
          to requests, but can't log in until its owner claims it.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-semibold text-gray-900">{claimed}</p>
          <p className="text-xs text-gray-500">Claimed (real accounts)</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-semibold text-gray-900">{unclaimed}</p>
          <p className="text-xs text-gray-500">Imported, not claimed</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-semibold text-gray-900">{invited}</p>
          <p className="text-xs text-gray-500">Invite already sent</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-1">1. Import a CSV</h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload a CSV with a header row, then map its columns to Mobi profile fields. Rows with
          an email that already exists are skipped, not overwritten.
        </p>
        <ImportForm />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-1">2. Send claim invites</h2>
        <p className="text-sm text-gray-500 mb-4">
          Emails everyone who's been imported but not yet invited, with a link to set a password
          and claim their account. Safe to click more than once — it only emails people who
          haven't already gotten an invite.
        </p>
        <SendInvitesButton />
      </div>
    </div>
  );
}
