import Link from "next/link";
import { prisma } from "@/lib/db";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default async function ResetPasswordPage({ params }: { params: { token: string } }) {
  const member = await prisma.member.findUnique({ where: { resetToken: params.token } });
  const valid = !!member && !!member.resetTokenExpires && member.resetTokenExpires > new Date();

  if (!valid) {
    return (
      <div className="max-w-sm mx-auto py-10 text-center">
        <h1 className="text-xl font-bold mb-2">This link's expired</h1>
        <p className="text-sm text-gray-500 mb-4">
          Reset links only work for an hour. Request a new one below.
        </p>
        <Link href="/forgot-password" className="text-brand-700 font-medium">
          Send a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="text-2xl font-bold mb-1">Set a new password</h1>
      <p className="text-sm text-gray-500 mb-6">For {member.email}</p>
      <ResetPasswordForm token={params.token} />
    </div>
  );
}
