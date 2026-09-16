"use client";

export interface RelationshipRow {
  label: string;
  notes: string;
}

// Reusable "where do you have solid relationships?" editor — used at
// signup and on the profile edit page. Freeform on purpose: a company name,
// an org, or a circle like "DC policy folks" are all valid.
export default function RelationshipsInput({
  rows,
  onChange,
}: {
  rows: RelationshipRow[];
  onChange: (rows: RelationshipRow[]) => void;
}) {
  function addRow() {
    onChange([...rows, { label: "", notes: "" }]);
  }
  function updateRow(idx: number, patch: Partial<RelationshipRow>) {
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label mb-0">Where do you have solid relationships? (optional)</label>
        <button type="button" onClick={addRow} className="btn-secondary text-xs">
          + Add
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        Not just where you work — anywhere you know people well enough to make a warm intro
        (a company, a team, a circle like "DC policy folks").
      </p>
      {rows.length === 0 && <p className="text-sm text-gray-400 mb-2">None added yet.</p>}
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:items-center border border-gray-100 rounded-lg p-3">
            <input
              className="input sm:w-48"
              placeholder="e.g. Google"
              value={row.label}
              onChange={(e) => updateRow(idx, { label: e.target.value })}
            />
            <input
              className="input flex-1"
              placeholder="How, briefly (optional)"
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
  );
}
