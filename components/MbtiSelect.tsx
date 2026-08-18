"use client";

import { MBTI_TYPES } from "@/lib/result-engine/temperament";

interface MbtiSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MbtiSelect({ value, onChange }: MbtiSelectProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {MBTI_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`rounded-lg border py-2 text-sm font-medium transition ${
            value === type
              ? "border-amber-500 bg-amber-500 text-white"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-amber-400"
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
