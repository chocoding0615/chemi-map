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
        className="w-full appearance-none rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
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
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brown/40">▾</span>
    </div>
  );
}
