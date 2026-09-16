"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Community {
  id: string;
  name: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityChoice, setCommunityChoice] = useState<string>("__new__");
  const [newCommunityName, setNewCommunityName] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    title: "",
    company: "",
    industry: "",
    location: "",
    bio: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/communities")
      .then((r) => r.json())
      .then((data) => {
        setCommunities(data.communities ?? []);
        if (data.communities?.length) setCommunityChoice(data.communities[0].id);
      })
      .catch(() => {});
  }, []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: Record<string, string> = { ...form };
    if (communityChoice === "__new__") {
      if (!newCommunityName.trim()) {
        setError("Please name your community/network");
        setLoading(false);
        return;
      }
      payload.newCommunityName = newCommunityName.trim();
    } else {
      payload.communityId = communityChoice;
    }

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
      <h1 className="text-2xl font-bold mb-1">Join your network</h1>
      <p className="text-sm text-gray-500 mb-6">
        Connector works for any trusted group — pick your existing network or start a new one.
      </p>
      <form onSubmit={onSubmit} className="card p-5 space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

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
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="label">Community / network</label>
          <select
            className="input"
            value={communityChoice}
            onChange={(e) => setCommunityChoice(e.target.value)}
          >
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="__new__">+ Start a new community</option>
          </select>
          {communityChoice === "__new__" && (
            <input
              className="input mt-2"
              placeholder="e.g. Riverside MBA Alumni"
              value={newCommunityName}
              onChange={(e) => setNewCommunityName(e.target.value)}
            />
          )}
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
