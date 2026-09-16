"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HELP_CATEGORIES, COMPENSATION_TYPES, type HelpCategory, type CompensationType } from "@/lib/enums";
import { HELP_CATEGORY_LABELS, COMPENSATION_LABELS } from "@/lib/labels";
import RelationshipsInput, { type RelationshipRow } from "./RelationshipsInput";

interface OfferingRow {
  category: HelpCategory;
  compensation: CompensationType;
  notes: string;
}

interface MemberFields {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  bio: string;
  linkedinUrl: string;
  openToRoles: boolean;
  openToGigWork: boolean;
}

export default function ProfileEditForm({
  member,
  offerings,
  relationships,
}: {
  member: MemberFields;
  offerings: OfferingRow[];
  relationships: RelationshipRow[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(member);
  const [rows, setRows] = useState<OfferingRow[]>(offerings);
  const [relRows, setRelRows] = useState<RelationshipRow[]>(relationships);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof MemberFields>(key: K, value: MemberFields[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addRow() {
    setRows((r) => [...r, { category: "COFFEE_CHAT", compensation: "FREE", notes: "" }]);
  }
  function updateRow(idx: number, patch: Partial<OfferingRow>) {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }
  function removeRow(idx: number) {
    setRows((r) => r.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const [profileRes, offeringsRes, relationshipsRes] = await Promise.all([
      fetch("/api/members/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          title: form.title,
          company: form.company,
          industry: form.industry,
          location: form.location,
          bio: form.bio,
          linkedinUrl: form.linkedinUrl,
          openToRoles: form.openToRoles,
          openToGigWork: form.openToGigWork,
        }),
      }),
      fetch("/api/members/me/offerings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerings: rows.map((r) => ({ ...r, notes: r.notes || undefined })),
        }),
      }),
      fetch("/api/members/me/relationships", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relationships: relRows
            .filter((r) => r.label.trim())
            .map((r) => ({ label: r.label.trim(), notes: r.notes.trim() || undefined })),
        }),
      }),
    ]);

    setSaving(false);
    if (!profileRes.ok || !offeringsRes.ok || !relationshipsRes.ok) {
      setError("Something went wrong saving your profile");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="card p-5 space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Title</label>
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
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input" rows={3} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
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
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.openToRoles}
              onChange={(e) => update("openToRoles", e.target.checked)}
            />
            Open to new roles
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.openToGigWork}
              onChange={(e) => update("openToGigWork", e.target.checked)}
            />
            Open to gig/freelance work
          </label>
        </div>
      </div>

      <div className="card p-5">
        <RelationshipsInput rows={relRows} onChange={setRelRows} />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">What are you willing to help with?</h2>
          <button type="button" onClick={addRow} className="btn-secondary text-xs">
            + Add
          </button>
        </div>
        {rows.length === 0 && <p className="text-sm text-gray-500 mb-2">Add at least one to start getting matched.</p>}
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:items-center border border-gray-100 rounded-lg p-3">
              <select
                className="input sm:w-48"
                value={row.category}
                onChange={(e) => updateRow(idx, { category: e.target.value as HelpCategory })}
              >
                {HELP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {HELP_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <select
                className="input sm:w-36"
                value={row.compensation}
                onChange={(e) => updateRow(idx, { compensation: e.target.value as CompensationType })}
              >
                {COMPENSATION_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {COMPENSATION_LABELS[c]}
                  </option>
                ))}
              </select>
              <input
                className="input flex-1"
                placeholder="Notes (optional)"
                value={row.notes}
                onChange={(e) => updateRow(idx, { notes: e.target.value })}
              />
              <button type="button" onClick={() => removeRow(idx)} className="btn-danger sm:w-auto">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </form>
  );
}
