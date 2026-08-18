"use client";

import { MBTI_TYPES } from "@/lib/result-engine/temperament";

interface MbtiSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MbtiSelect({ value, onChange }: MbtiSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-amber-900/10 bg-amber-50/60 px-4 py-2.5 text-sm text-amber-950 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
      >
        <option value="" disabled>
          MBTI를 선택해주세요
        </option>
        {MBTI_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-amber-900/40">
        ▾
      </span>
    </div>
  );
}
