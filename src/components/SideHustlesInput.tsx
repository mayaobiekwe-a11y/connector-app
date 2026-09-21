"use client";

export interface SideHustleRow {
  name: string;
  description: string;
  url: string;
}

// "What are you building outside your day job?" editor — used at signup
// and on the profile edit page. For a lot of members the day job pays the
// bills but a side hustle/passion project is what they actually want to be
// known for, so it's modeled separately from title/company rather than
// buried in the bio.
export default function SideHustlesInput({
  rows,
  onChange,
}: {
  rows: SideHustleRow[];
  onChange: (rows: SideHustleRow[]) => void;
}) {
  function addRow() {
    onChange([...rows, { name: "", description: "", url: "" }]);
  }
  function updateRow(idx: number, patch: Partial<SideHustleRow>) {
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label mb-0">Side hustle(s) (optional)</label>
        <button type="button" onClick={addRow} className="btn-secondary text-xs">
          + Add
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        A business, project, or craft you're building outside your day job — if that's what you'd
        rather be known for, put it here.
      </p>
      {rows.length === 0 && <p className="text-sm text-gray-400 mb-2">None added yet.</p>}
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="border border-gray-100 rounded-lg p-3 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="input sm:w-48"
                placeholder="Name, e.g. Wick & Co Candles"
                value={row.name}
                onChange={(e) => updateRow(idx, { name: e.target.value })}
              />
              <input
                className="input flex-1"
                placeholder="One line about it (optional)"
                value={row.description}
                onChange={(e) => updateRow(idx, { description: e.target.value })}
              />
              <button type="button" onClick={() => removeRow(idx)} className="btn-danger sm:w-auto">
                Remove
              </button>
            </div>
            <input
              className="input"
              type="url"
              placeholder="Link (optional) — website, Instagram, Etsy shop..."
              value={row.url}
              onChange={(e) => updateRow(idx, { url: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
