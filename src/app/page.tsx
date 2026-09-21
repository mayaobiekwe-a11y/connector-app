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
          Everyone needs a Marie.
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Connector is a trusted network for referrals, mentorship, and career help — built to
          work the way the best-connected person you know already does.
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

      <div className="mt-12 max-w-2xl border-l-4 border-brand-200 pl-5 sm:pl-6">
        <p className="text-gray-600">
          Growing up, if my mom knew someone needed a job or was looking for a resource, she took
          it seriously. She remembered people — not just their names, but what they needed and
          what they knew. She was an extrovert who was always meeting someone new, and when she
          met someone whose line of work lined up with someone else's need, she made the
          connection. No app, no form. Just paying attention, and following through.
        </p>
        <p className="mt-4 text-gray-600">
          Not a lot of people are like Marie. Most networks aren't. LinkedIn is full of messages
          that never get a reply. Connector exists because that kind of person shouldn't be rare —
          your community already has people who'd help if you asked them directly. It just needs
          someone paying attention, and asking on your behalf.
        </p>
      </div>

      <p className="mt-8 max-w-2xl text-lg font-medium text-gray-900">
        A community isn't a stagnant list of names in a group chat. It's a place where people
        actually connect and build together — where showing up means sharing what you know, and
        opening yourself to what someone else needs.
      </p>

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
