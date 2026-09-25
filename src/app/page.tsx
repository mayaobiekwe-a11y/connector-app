import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";

const STEPS = [
  {
    title: "Ask",
    body: "Type your request like you'd text a friend — \"I need someone who's worked in public policy to review my resume.\"",
  },
  {
    title: "Get connected",
    body: "Mobi privately asks the best-matched people in your network — and your ask shows up in the community feed too, so anyone who can help can just jump in.",
  },
  {
    title: "Get help",
    body: "Matched members accept or decline, then you coordinate in a simple thread.",
  },
  {
    title: "Earn trust",
    body: "Helpful members earn points, badges, and more ask credits to keep asking for help themselves.",
  },
];

export default async function HomePage() {
  const member = await getCurrentMember();
  if (member) redirect("/dashboard");

  return (
    <div className="py-6 sm:py-10">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-brand-200 to-accent-200 opacity-40 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <span className="eyebrow">A trusted-network referral platform</span>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Mobi remembers everyone.
            <br />
            Just ask Mobi.
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Mobi finds the right person in your network and asks them directly — and your
            request shows up in the community feed too, so anyone who can help, can.
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
      </div>

      <div className="mt-8 max-w-2xl rounded-2xl bg-brand-50/60 border border-brand-100 px-6 py-6 sm:px-8 sm:py-7">
        <p className="text-gray-700">
          Marie Obi is social, loves meeting people, and remembers the details that connect
          them. When someone is looking for something specific, a job, a program, a contact,
          she's usually the one who already knows who to call.
        </p>
        <p className="mt-3 font-medium text-gray-900">
          Mobi carries that same instinct into a whole network. We named it after her.
        </p>
      </div>

      <p className="mt-8 max-w-2xl text-lg font-medium text-gray-900">
        A community is a place where people connect and build together, where showing up
        means sharing what you know and opening yourself to what someone else needs.
      </p>

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <div key={step.title} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                {i + 1}
              </span>
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
