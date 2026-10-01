"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { NEED_CATEGORIES, type NeedCategory } from "@/lib/enums";
import { NEED_CATEGORY_LABELS } from "@/lib/labels";

export default function ResourceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [categories, setCategories] = useState<NeedCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggle(c: NeedCategory) {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (categories.length === 0) {
      setError("Pick at least one category so this shows up on the resources page.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description.trim() || undefined,
        url: url.trim() || undefined,
        phone: phone.trim() || undefined,
        categories,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Something went wrong");
      return;
    }
    setName("");
    setDescription("");
    setUrl("");
    setPhone("");
    setCategories([]);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="label">Name</label>
        <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. RAINN National Sexual Assault Hotline" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Link (optional)</label>
          <input className="input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 800-656-4673" />
        </div>
      </div>
      <div>
        <label className="label">Description (optional)</label>
        <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="label mb-1">Categories</label>
        <div className="grid grid-cols-2 gap-2">
          {NEED_CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm border border-gray-100 rounded-lg p-2 cursor-pointer">
              <input type="checkbox" checked={categories.includes(c)} onChange={() => toggle(c)} />
              {NEED_CATEGORY_LABELS[c]}
            </label>
          ))}
        </div>
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Adding..." : "Add resource"}
      </button>
    </form>
  );
}
