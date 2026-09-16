import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";

export default async function HomePage() {
  const member = await getCurrentMember();
  if (member) redirect("/dashboard");

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          Warm intros, from people who actually know you.
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Connector is a trusted network for referrals, mentorship, and career help.
          Ask in plain language — our AI finds the right person in your network and
          asks them directly, instead of a cold blast on LinkedIn.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/signup" className="btn-primary text-base px-6 py-3">
            Join your network
          </Link>
          <Link href="/login" className="btn-secondary text-base px-6 py-3">
            Log in
          </Link>
        </div>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900">1. Ask</h3>
          <p className="mt-1 text-sm text-gray-600">
            Type your request like you'd text a friend — "I need someone who's worked in
            public policy to review my resume."
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900">2. Get connected</h3>
          <p className="mt-1 text-sm text-gray-600">
            AI matches you to the best people in your network and tells you why, then
            reaches out to them directly on your behalf.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900">3. Get help</h3>
          <p className="mt-1 text-sm text-gray-600">
            Matched members accept or decline, then you coordinate in a simple thread.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900">4. Earn trust</h3>
          <p className="mt-1 text-sm text-gray-600">
            Helpful members earn points, badges, and a reputation as a Trusted Connector.
          </p>
        </div>
      </div>
    </div>
  );
}
