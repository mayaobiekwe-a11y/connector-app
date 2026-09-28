"use client";

import { useState, ChangeEvent } from "react";

interface FieldDef {
  key: string;
  label: string;
  required?: boolean;
}

const FIELDS: FieldDef[] = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email", required: true },
  { key: "title", label: "Title" },
  { key: "company", label: "Company" },
  { key: "industry", label: "Industry" },
  { key: "location", label: "Location" },
  { key: "bio", label: "Bio" },
  { key: "linkedinUrl", label: "LinkedIn URL" },
  { key: "relationships", label: "Relationships (semicolon-separated)" },
  { key: "sideHustles", label: "Side hustles (semicolon-separated)" },
];

// Minimal CSV parser that handles quoted fields (commas/newlines inside
// quotes, escaped "" for a literal quote) — good enough for a typical
// Airtable/Google Forms export without pulling in a dependency.
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((f) => f.trim() !== "")) rows.push(row);
  }
  return rows;
}

function guessColumn(headers: string[], keywords: string[]): number {
  const idx = headers.findIndex((h) => keywords.some((k) => h.toLowerCase().includes(k)));
  return idx;
}

export default function ImportForm() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const rows = parseCSV(text);
      if (rows.length < 1) {
        setError("Couldn't read any rows from that file.");
        return;
      }
      const [head, ...rest] = rows;
      setHeaders(head);
      setDataRows(rest);

      const auto: Record<string, number> = {};
      const guesses: Record<string, string[]> = {
        name: ["name"],
        email: ["email"],
        title: ["title", "role"],
        company: ["company", "employer"],
        industry: ["industry", "sector"],
        location: ["location", "city"],
        bio: ["bio", "about"],
        linkedinUrl: ["linkedin"],
        relationships: ["relationship", "connection"],
        sideHustles: ["side hustle", "side project", "business"],
      };
      for (const field of FIELDS) {
        const idx = guessColumn(head, guesses[field.key] ?? []);
        if (idx !== -1) auto[field.key] = idx;
      }
      setMapping(auto);
    };
    reader.readAsText(file);
  }

  function mappedValue(row: string[], key: string): string {
    const idx = mapping[key];
    return idx != null && row[idx] != null ? row[idx].trim() : "";
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    setResult(null);

    const rows = dataRows
      .map((row) => ({
        name: mappedValue(row, "name"),
        email: mappedValue(row, "email"),
        title: mappedValue(row, "title") || undefined,
        company: mappedValue(row, "company") || undefined,
        industry: mappedValue(row, "industry") || undefined,
        location: mappedValue(row, "location") || undefined,
        bio: mappedValue(row, "bio") || undefined,
        linkedinUrl: mappedValue(row, "linkedinUrl") || undefined,
        relationships: mappedValue(row, "relationships") || undefined,
        sideHustles: mappedValue(row, "sideHustles") || undefined,
      }))
      .filter((r) => r.name && r.email);

    if (rows.length === 0) {
      setSubmitting(false);
      setError("No rows have both a name and an email mapped — check your column mapping.");
      return;
    }

    const res = await fetch("/api/admin/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Import failed");
      return;
    }
    setResult(await res.json());
  }

  const preview = dataRows.slice(0, 5);

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        onChange={onFile}
        className="block w-full text-sm text-gray-600 file:mr-3 file:btn-secondary file:border-0"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {headers.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label className="label">
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>
                <select
                  className="input"
                  value={mapping[field.key] ?? ""}
                  onChange={(e) =>
                    setMapping((m) => {
                      const next = { ...m };
                      if (e.target.value === "") delete next[field.key];
                      else next[field.key] = Number(e.target.value);
                      return next;
                    })
                  }
                >
                  <option value="">— none —</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>
                      {h || `Column ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {preview.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                Preview (first {preview.length} of {dataRows.length} rows)
              </p>
              <div className="overflow-x-auto">
                <table className="text-xs w-full border-collapse">
                  <thead>
                    <tr className="text-left text-gray-400">
                      {FIELDS.map((f) => (
                        <th key={f.key} className="pr-4 pb-1 font-medium">
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        {FIELDS.map((f) => (
                          <td key={f.key} className="pr-4 py-1 text-gray-700 max-w-[160px] truncate">
                            {mappedValue(row, f.key) || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button type="button" onClick={onSubmit} disabled={submitting} className="btn-primary">
            {submitting ? "Importing..." : `Import ${dataRows.length} rows`}
          </button>
        </>
      )}

      {result && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          Imported {result.created}, skipped {result.skipped} (email already existed)
          {result.errors.length > 0 && `, ${result.errors.length} failed`}.
        </p>
      )}
    </div>
  );
}
