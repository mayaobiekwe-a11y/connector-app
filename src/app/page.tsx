import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/session";
import HomeAskBar from "@/components/HomeAskBar";
import Logo from "@/components/Logo";
import FeatureShowcase from "@/components/FeatureShowcase";

export default async function HomePage() {
  const member = await getCurrentMember();
  if (member) redirect("/dashboard");

  return (
    <div className="py-10 sm:py-20">
      <div className="text-center">
        <div className="flex justify-center mb-6 animate-fade-up">
          <span className="inline-block animate-breathe">
            <Logo size={56} />
          </span>
        </div>
        <span className="eyebrow animate-fade-up [animation-delay:100ms]">Just ask Mobi</span>
        <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-tight animate-fade-up [animation-delay:200ms]">
          How can Mobi
          <br />
          <span className="bg-gradient-to-r from-brand-700 to-accent-500 bg-clip-text text-transparent">
            help you?
          </span>
        </h1>
        <p className="mt-5 text-lg text-gray-600 max-w-xl mx-auto animate-fade-up [animation-delay:300ms]">
          Type it below. Mobi will tell you what it hears, then find who in the network can
          actually help once you're in.
        </p>
        <div className="mt-8 max-w-2xl mx-auto text-left animate-fade-up [animation-delay:400ms]">
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

      <FeatureShowcase />
    </div>
  );
}
