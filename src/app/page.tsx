import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import HomeAskBar from "@/components/HomeAskBar";
import Logo from "@/components/Logo";

const STEPS = [
  {
    title: "Ask",
    body: "Type your request like you'd text a friend — \"I need someone who's worked in public policy to review my resume.\"",
  },
  {
    title: "Get connected",
    body: "Mobi privately asks the best-matched people in the network — and your ask shows up in the community feed too, so anyone who can help can just jump in.",
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
    <div className="py-10 sm:py-20">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Logo size={56} />
        </div>
        <span className="eyebrow">Just ask Mobi</span>
        <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
          What do you need
          <br />
          <span className="text-brand-600">right now?</span>
        </h1>
        <p className="mt-5 text-lg text-gray-600 max-w-xl mx-auto">
          Type it below. Mobi will tell you what it hears, then find who in the network can
          actually help once you're in.
        </p>
        <div className="mt-8 max-w-2xl mx-auto text-left">
          <HomeAskBar />
        </div>
      </div>

      <div className="mt-16 rounded-2xl bg-brand-50/60 border border-brand-100 px-6 py-6 sm:px-8 sm:py-7">
        <p className="text-gray-700">
          <span className="font-semibold text-gray-900">Up to 80% of open positions</span> are
          filled through personal referrals rather than public listings.
        </p>
        <p className="mt-3 text-gray-700">
          With AI now screening and filtering candidates, you need community now, more than
          ever. Building your network across industries and sectors promotes resilience and
          stability in your career, and reduces impact and exposure when the market shifts.
        </p>
      </div>

      <p className="mt-10 text-center text-2xl font-bold text-gray-900">
        Let Mobi help you find your people.
      </p>

      <h2 className="mt-14 text-sm font-semibold text-gray-900">Here's how it works:</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
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
