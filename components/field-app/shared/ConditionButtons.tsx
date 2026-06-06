"use client";

import type { Condition } from "@/lib/simple-field";

export function ConditionButtons({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: Condition) => void;
}) {
  const options: Condition[] = ["fair", "good", "great"];

  return (
    <div className="hs-segmented hs-condition-grid">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={value === option ? "is-active" : ""}
          onClick={() => onChange(option)}
        >
          {option === "fair" ? "Fair" : option === "good" ? "Good" : "Great"}
        </button>
      ))}
    </div>
  );
}
