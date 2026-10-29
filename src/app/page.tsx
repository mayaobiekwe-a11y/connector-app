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
          Describe it below. Mobi will reach into the network to find the best people and
          resources which fit your needs.
        </p>
        <div className="mt-8 max-w-2xl mx-auto text-left animate-fade-up [animation-delay:400ms]">
          <HomeAskBar />
        </div>
      </div>

      <div className="mt-16 text-center max-w-xl mx-auto">
        <p className="text-xl font-semibold text-brand-700">Mobi is your super connector.</p>
        <p className="mt-3 text-gray-600">
          The best connectors remember everyone, who they are, what they need, what they're
          good at. Mobi works the same way: matching people by what they're looking for, what
          they offer, and where real interests overlap. The more you tell it, the sharper it
          gets.
        </p>
      </div>

      <FeatureShowcase />
    </div>
  );
}
