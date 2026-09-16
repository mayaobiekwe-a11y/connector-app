import Link from "next/link";
import { getCurrentMember } from "@/lib/session";
import { badgeForPoints } from "@/lib/credit";
import { getMemberPoints } from "@/lib/credit";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const member = await getCurrentMember();
  const points = member ? await getMemberPoints(member.id) : 0;
  const badge = member ? badgeForPoints(points) : null;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="font-semibold text-brand-700 text-lg">
            Connector
          </Link>
          {member ? (
            <nav className="flex items-center gap-3 sm:gap-4 text-sm">
              <Link href="/dashboard" className="hidden sm:inline text-gray-600 hover:text-brand-700">
                Dashboard
              </Link>
              {member.isAdmin && (
                <Link href="/admin" className="hidden sm:inline text-gray-600 hover:text-brand-700">
                  Admin
                </Link>
              )}
              <Link
                href={`/profile/${member.id}`}
                className="flex items-center gap-2 text-gray-700 hover:text-brand-700"
              >
                <span className="hidden sm:inline">{member.name}</span>
                {badge && (
                  <span className="badge bg-brand-50 text-brand-700 border border-brand-100">
                    {badge.label}
                  </span>
                )}
              </Link>
              <LogoutButton />
            </nav>
          ) : (
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/login" className="text-gray-600 hover:text-brand-700">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
