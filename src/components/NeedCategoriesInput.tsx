"use client";

import { NEED_CATEGORIES, type NeedCategory } from "@/lib/enums";
import { NEED_CATEGORY_LABELS } from "@/lib/labels";

// Reusable "what are you hoping to find here?" checklist — used at signup
// and on the profile edit page. Not tied to any one request; just gives
// admins and matching a sense of what a member came looking for.
export default function NeedCategoriesInput({
  selected,
  onChange,
}: {
  selected: NeedCategory[];
  onChange: (categories: NeedCategory[]) => void;
}) {
  function toggle(category: NeedCategory) {
    onChange(
      selected.includes(category) ? selected.filter((c) => c !== category) : [...selected, category]
    );
  }

  return (
    <div>
      <label className="label mb-0">What are you hoping to find here? (optional)</label>
      <p className="text-xs text-gray-500 mb-2">Pick as many as apply — this just helps us point you in the right direction.</p>
      <div className="grid grid-cols-2 gap-2">
        {NEED_CATEGORIES.map((category) => (
          <label
            key={category}
            className="flex items-center gap-2 text-sm border border-gray-100 rounded-lg p-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(category)}
              onChange={() => toggle(category)}
            />
            {NEED_CATEGORY_LABELS[category]}
          </label>
        ))}
      </div>
    </div>
  );
}
