"use client";

import { useState } from "react";

export default function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="text-2xl leading-none"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <span className={(hover || value) >= n ? "text-amber-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );
}
