import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentMember } from "@/lib/session";
import ClaimForm from "@/components/ClaimForm";

export default async function ClaimPage({ params }: { params: { token: string } }) {
  const viewer = await getCurrentMember();
  if (viewer) redirect("/dashboard");

  const member = await prisma.member.findUnique({ where: { claimToken: params.token } });

  if (!member) {
    return (
      <div className="max-w-sm mx-auto py-10 text-center">
        <h1 className="text-xl font-bold mb-2">Invite not found</h1>
        <p className="text-sm text-gray-500">
          This link isn't valid. If you think that's a mistake, reach out to whoever invited you.
        </p>
      </div>
    );
  }

  if (member.claimedAt) {
    return (
      <div className="max-w-sm mx-auto py-10 text-center">
        <h1 className="text-xl font-bold mb-2">Already claimed</h1>
        <p className="text-sm text-gray-500 mb-4">This account has already been set up.</p>
        <Link href="/login" className="text-brand-700 font-medium">
          Log in instead
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="text-2xl font-bold mb-1">Welcome, {member.name.split(" ")[0]}</h1>
      <p className="text-sm text-gray-500 mb-6">
        You're already on Mobi &mdash; set a password to claim your account and start using it.
      </p>
      <ClaimForm token={params.token} email={member.email} />
    </div>
  );
}
