"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RelationshipsInput, { type RelationshipRow } from "@/components/RelationshipsInput";
import SideHustlesInput, { type SideHustleRow } from "@/components/SideHustlesInput";
import { PROFILE_TYPE_LABELS } from "@/lib/labels";
import type { ProfileType } from "@/lib/enums";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    title: "",
    company: "",
    industry: "",
    location: "",
    bio: "",
    linkedinUrl: "",
    avatarUrl: "",
    monthlyCapacity: "",
  });
  const [profileType, setProfileType] = useState<ProfileType>("GENERAL");
  const [visibleInDirectory, setVisibleInDirectory] = useState(true);
  const [relationships, setRelationships] = useState<RelationshipRow[]>([]);
  const [sideHustles, setSideHustles] = useState<SideHustleRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: Record<string, unknown> = {
      ...form,
      monthlyCapacity: form.monthlyCapacity ? Number(form.monthlyCapacity) : undefined,
      profileType,
      visibleInDirectory,
      relationships: relationships
        .filter((r) => r.label.trim())
        .map((r) => ({ label: r.label.trim(), notes: r.notes.trim() || undefined })),
      sideHustles: sideHustles
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          description: s.description.trim() || undefined,
          url: s.url.trim() || undefined,
        })),
    };

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Something went wrong");
      return;
    }
    router.push("/profile/edit?welcome=1");
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto py-10">
      <h1 className="text-2xl font-bold mb-1">Join the network</h1>
      <p className="text-sm text-gray-500 mb-6">
        Ask for what you need, offer what you know — every member here can see and reach you.
      </p>
      <form onSubmit={onSubmit} className="card p-5 space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="label">Profile type</label>
          <div className="flex gap-2">
            {(Object.keys(PROFILE_TYPE_LABELS) as ProfileType[]).map((pt) => (
              <button
                type="button"
                key={pt}
                onClick={() => setProfileType(pt)}
                className={`flex-1 text-sm rounded-lg border px-3 py-2 text-left ${
                  profileType === pt
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {PROFILE_TYPE_LABELS[pt]}
                {pt === "SERVICE_PROVIDER" && (
                  <span className={`block text-xs ${profileType === pt ? "text-brand-100" : "text-gray-400"}`}>
                    Paid subscription
                  </span>
                )}
              </button>
            ))}
          </div>
          {profileType === "SERVICE_PROVIDER" && (
            <p className="text-xs text-gray-500 mt-1">
              This prototype doesn't process real payments — your Service Provider profile
              activates immediately and can be managed from your profile later.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Full name</label>
            <input className="input" required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Current title</label>
            <input className="input" value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input" value={form.company} onChange={(e) => update("company", e.target.value)} />
          </div>
          <div>
            <label className="label">Industry</label>
            <input className="input" value={form.industry} onChange={(e) => update("industry", e.target.value)} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label">Short bio</label>
            <textarea
              className="input"
              rows={3}
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="What you've worked on, what you know well..."
            />
          </div>
          <div>
            <label className="label">LinkedIn (optional)</label>
            <input
              className="input"
              type="url"
              placeholder="https://linkedin.com/in/you"
              value={form.linkedinUrl}
              onChange={(e) => update("linkedinUrl", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Photo URL (optional)</label>
            <input
              className="input"
              type="url"
              placeholder="https://..."
              value={form.avatarUrl}
              onChange={(e) => update("avatarUrl", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="label">Monthly capacity (optional)</label>
            <input
              className="input"
              type="number"
              min={0}
              placeholder="e.g. 3 — how many requests you can take on per month"
              value={form.monthlyCapacity}
              onChange={(e) => update("monthlyCapacity", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank for no limit. This keeps you from getting overloaded once people start
              relying on you.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={visibleInDirectory}
            onChange={(e) => setVisibleInDirectory(e.target.checked)}
          />
          <span>
            Show my profile in the member directory and in AI matching.
            <span className="block text-xs text-gray-400">
              You can turn this off anytime — nobody will be able to find or match with you.
            </span>
          </span>
        </label>

        <div className="border-t border-gray-100 pt-4">
          <SideHustlesInput rows={sideHustles} onChange={setSideHustles} />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <RelationshipsInput rows={relationships} onChange={setRelationships} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-700 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
