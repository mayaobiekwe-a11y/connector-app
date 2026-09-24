import Link from "next/link";
import { getCurrentMember } from "@/lib/session";
import { badgeForPoints } from "@/lib/credit";
import { getMemberPoints } from "@/lib/credit";
import LogoutButton from "./LogoutButton";
import Avatar from "./Avatar";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hidden sm:inline-block rounded-full px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
    >
      {children}
    </Link>
  );
}

export default async function Navbar() {
  const member = await getCurrentMember();
  const points = member ? await getMemberPoints(member.id) : 0;
  const badge = member ? badgeForPoints(points) : null;

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-bold">
              M
            </span>
            Mobi
          </Link>
          {member ? (
            <nav className="flex items-center gap-1 sm:gap-2 text-sm">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/feed">Feed</NavLink>
              <NavLink href="/directory">Directory</NavLink>
              {member.isAdmin && <NavLink href="/admin">Admin</NavLink>}
              <Link
                href={`/profile/${member.id}`}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 sm:pr-3 text-gray-700 transition-colors hover:bg-gray-100"
              >
                <Avatar name={member.name} avatarUrl={member.avatarUrl} size={28} />
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
