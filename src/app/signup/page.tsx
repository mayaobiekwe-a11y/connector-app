"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import RelationshipsInput, { type RelationshipRow } from "@/components/RelationshipsInput";
import { PENDING_ASK_KEY } from "@/components/HomeAskBar";
import { PROFILE_TYPE_LABELS } from "@/lib/labels";
import type { ProfileType } from "@/lib/enums";

// Kept short on purpose: only the account basics and the relationships
// gate (the warm-intro quality bar) are required to create an account.
// Everything else, title/industry/location/bio, needs, side hustles,
// LinkedIn, photo, capacity, is optional and collected later via the
// "finish your profile" checklist on the dashboard (see
// OnboardingChecklist) and /profile/edit, instead of blocking signup.
const STEPS = ["account", "relationships", "finish"] as const;
type Step = (typeof STEPS)[number];

const STEP_COPY: Record<Step, { title: string; subtitle: string }> = {
  account: { title: "Let's get you set up", subtitle: "Just the basics, you can fill in the rest later." },
  relationships: {
    title: "Where do you have real relationships?",
    subtitle: "At least 2, that's what makes a warm intro possible.",
  },
  finish: { title: "Almost there", subtitle: "What brings you to Mobi, and who can see your profile." },
};

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [pendingAsk, setPendingAsk] = useState<string | null>(null);

  useEffect(() => {
    setPendingAsk(sessionStorage.getItem(PENDING_ASK_KEY));
  }, []);

  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const step = STEPS[stepIndex];

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  });
  const [profileType, setProfileType] = useState<ProfileType>("GENERAL");
  const [visibleInDirectory, setVisibleInDirectory] = useState(true);
  const [relationships, setRelationships] = useState<RelationshipRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep(): string | null {
    if (step === "account") {
      if (!form.name.trim()) return "Enter your name.";
      if (!form.email.trim()) return "Enter your email.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
    }
    if (step === "relationships") {
      const filled = relationships.filter((r) => r.label.trim());
      if (filled.length < 2) {
        return "Add at least 2 places you have a real relationship, that's what makes a warm intro possible.";
      }
    }
    return null;
  }

  function goNext() {
    const err = validateStep();
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    // Reflect their company back as a relationship suggestion, since they
    // just told us, no reason to make them retype it.
    if (step === "account" && relationships.length === 0 && form.company.trim()) {
      setRelationships([{ label: form.company.trim(), notes: "" }]);
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (step !== "finish") {
      goNext();
      return;
    }

    setError(null);
    const err = validateStep();
    if (err) {
      setStepError(err);
      return;
    }

    const filledRelationships = relationships
      .filter((r) => r.label.trim())
      .map((r) => ({ label: r.label.trim(), notes: r.notes.trim() || undefined }));

    setLoading(true);

    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      password: form.password,
      company: form.company.trim() || undefined,
      profileType,
      visibleInDirectory,
      ref: ref || undefined,
      relationships: filledRelationships,
    };

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setLoading(false);
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Something went wrong");
      return;
    }

    // If they typed an ask on the homepage before signing up, fire it for
    // real now that they have an account, and take them straight to the
    // results instead of the usual "finish your profile" welcome screen.
    if (pendingAsk) {
      sessionStorage.removeItem(PENDING_ASK_KEY);
      const askRes = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pendingAsk }),
      });
      const askData = await askRes.json().catch(() => ({}));
      setLoading(false);
      if (askRes.ok && askData.request?.id) {
        router.push(`/requests/${askData.request.id}?welcome=1`);
        router.refresh();
        return;
      }
    }

    setLoading(false);
    router.push("/profile/edit?welcome=1");
    router.refresh();
  }

  const copy = STEP_COPY[step];

  return (
    <div
      className="rounded-3xl p-4 sm:p-10"
      style={{ background: "linear-gradient(180deg, #1f1229 0%, #2d1a3d 100%)" }}
    >
      <div className="max-w-md mx-auto">
        <div className="flex gap-1.5 pt-2 pb-8">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-white" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {pendingAsk && stepIndex === 0 && (
          <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 mb-6 text-sm text-white">
            Finish setting up and Mobi will go find who can help with: <em>"{pendingAsk}"</em>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">{copy.subtitle}</p>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            {stepError && <p className="text-sm text-red-600 mb-4">{stepError}</p>}

            {step === "account" && (
              <div className="space-y-4">
                <div>
                  <label className="label">Full name</label>
                  <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    className="input"
                    type="password"
                    minLength={6}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Company (optional)</label>
                  <input
                    className="input"
                    placeholder="e.g. Google"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">We'll suggest it as a relationship next.</p>
                </div>
              </div>
            )}

            {step === "relationships" && (
              <div>
                {form.company.trim() && (
                  <p className="text-xs text-gray-500 mb-2">
                    Added {form.company.trim()}, edit or add more below.
                  </p>
                )}
                <RelationshipsInput rows={relationships} onChange={setRelationships} minRequired={2} />
              </div>
            )}

            {step === "finish" && (
              <div className="space-y-5">
                <div>
                  <label className="label mb-2 block">What brings you to Mobi?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(PROFILE_TYPE_LABELS) as ProfileType[]).map((pt) => {
                      const isSelected = profileType === pt;
                      return (
                        <button
                          type="button"
                          key={pt}
                          onClick={() => setProfileType(pt)}
                          className={`relative text-left rounded-xl border-2 p-4 transition-colors ${
                            isSelected ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-3 right-3 h-4 w-4 rounded-full border-2 flex items-center justify-center text-[10px] text-white ${
                              isSelected ? "bg-brand-600 border-brand-600" : "border-gray-300"
                            }`}
                          >
                            {isSelected && "✓"}
                          </span>
                          <span className="text-xl leading-none">{pt === "SERVICE_PROVIDER" ? "💼" : "🤝"}</span>
                          <p className="mt-2 text-sm font-medium text-gray-900 pr-4">{PROFILE_TYPE_LABELS[pt]}</p>
                          {pt === "SERVICE_PROVIDER" && (
                            <p className="mt-1 text-xs text-gray-400">Paid subscription</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {profileType === "SERVICE_PROVIDER" && (
                    <p className="text-xs text-gray-500 mt-3">
                      This prototype doesn't process real payments. Your Service Provider profile
                      activates immediately and can be managed from your profile later.
                    </p>
                  )}
                </div>

                <label className="flex items-start gap-2 text-sm text-gray-700 border-t border-gray-100 pt-4">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={visibleInDirectory}
                    onChange={(e) => setVisibleInDirectory(e.target.checked)}
                  />
                  <span>
                    Show my profile in the member directory and in AI matching.
                    <span className="block text-xs text-gray-400">
                      You can turn this off anytime, nobody will be able to find or match with you.
                    </span>
                  </span>
                </label>

                <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
                  Add the rest anytime from your dashboard, the more Mobi knows, the better it
                  connects you.
                </p>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              {stepIndex > 0 && (
                <button type="button" onClick={goBack} className="btn-secondary flex-1">
                  Back
                </button>
              )}
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {step === "finish" ? (loading ? "Creating account..." : "Create account") : "Next"}
              </button>
            </div>
          </div>
        </form>

        <p className="text-sm text-white/70 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-white font-medium underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
