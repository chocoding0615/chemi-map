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
          className={`rounded-xl py-2 text-sm font-semibold transition ${
            value === type
              ? "bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/25"
              : "bg-amber-50/60 text-amber-900/70 ring-1 ring-amber-900/10 hover:bg-amber-100"
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
