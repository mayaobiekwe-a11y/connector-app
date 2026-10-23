"use client";

import { NEED_CATEGORIES, type NeedCategory } from "@/lib/enums";
import { NEED_CATEGORY_LABELS } from "@/lib/labels";

const ICONS: Record<string, string> = {
  MENTAL_HEALTH: "🧠",
  HEALTHCARE: "🩺",
  CAREER_SERVICES: "💼",
  GENERAL_NETWORKING: "🤝",
  LEGAL: "⚖️",
  FINANCIAL_PLANNING: "💰",
  BUSINESS_ENTREPRENEURSHIP: "🚀",
  MENTORSHIP: "🧭",
  SEXUAL_ASSAULT_SUPPORT: "💜",
  WORKPLACE_HARASSMENT: "🛡️",
};

// Reusable "what are you hoping to find here?" card picker — used at signup
// and on the profile edit page. Not tied to any one request; just gives
// admins and matching a sense of what a member came looking for.
export default function NeedCategoriesInput({
  selected,
  onChange,
  title = "What are you hoping to find here?",
  subtitle = "Pick as many as apply — this just helps us point you in the right direction.",
}: {
  selected: NeedCategory[];
  onChange: (categories: NeedCategory[]) => void;
  title?: string;
  subtitle?: string;
}) {
  function toggle(category: NeedCategory) {
    onChange(
      selected.includes(category) ? selected.filter((c) => c !== category) : [...selected, category]
    );
  }

  return (
    <div>
      <label className="label mb-0">{title}</label>
      <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {NEED_CATEGORIES.map((category) => {
          const isSelected = selected.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggle(category)}
              className={`relative text-left rounded-xl border-2 p-3 transition-colors ${
                isSelected
                  ? "border-brand-600 bg-brand-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span
                className={`absolute top-2 right-2 h-4 w-4 rounded-full border-2 flex items-center justify-center text-[10px] text-white ${
                  isSelected ? "bg-brand-600 border-brand-600" : "border-gray-300"
                }`}
              >
                {isSelected && "✓"}
              </span>
              <span className="text-xl leading-none">{ICONS[category] ?? "✨"}</span>
              <p className="mt-2 text-sm font-medium text-gray-900 pr-4">
                {NEED_CATEGORY_LABELS[category]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
