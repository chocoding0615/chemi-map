"use client";

import { useEffect, useState } from "react";

interface BirthDatePickerProps {
  /** "YYYY-MM-DD" 또는 미입력 시 "" */
  value: string;
  onChange: (value: string) => void;
  isLunar: boolean;
  onLunarChange: (isLunar: boolean) => void;
  /** 음력일 때만 의미 있음 — 넘기지 않으면 윤달 선택 UI 자체가 안 보임 */
  isLeapMonth?: boolean;
  onLeapMonthChange?: (isLeapMonth: boolean) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate(); // 윤년 자동 반영
}

function isValidDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12) return false;
  return d >= 1 && d <= daysInMonth(y, m);
}

// 8자리 숫자(예: 19920615) 한 번에 입력 + 양력/음력 인라인 선택.
// 완성된(8자리, 유효한) 값이거나 완전히 비었을 때만 부모에 emit한다 — 타이핑 중간에
// 부모 value가 갱신→다시 이 컴포넌트로 내려오면서 입력 중인 숫자가 지워지는 걸 막기 위함.
export default function BirthDatePicker({
  value,
  onChange,
  isLunar,
  onLunarChange,
  isLeapMonth,
  onLeapMonthChange,
}: BirthDatePickerProps) {
  const [digits, setDigits] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!value) {
      setDigits("");
      return;
    }
    const [y, m, d] = value.split("-");
    if (y && m && d) setDigits(`${y}${m}${d}`);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [value]);

  function handleChange(raw: string) {
    const next = raw.replace(/\D/g, "").slice(0, 8);
    setDigits(next);

    if (next.length === 8) {
      const y = Number(next.slice(0, 4));
      const m = Number(next.slice(4, 6));
      const d = Number(next.slice(6, 8));
      if (y >= 1930 && y <= CURRENT_YEAR && isValidDate(y, m, d)) {
        onChange(`${next.slice(0, 4)}-${next.slice(4, 6)}-${next.slice(6, 8)}`);
      } else {
        onChange("");
      }
    } else if (next.length === 0) {
      onChange("");
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          value={digits}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="19920615"
          className="min-w-0 flex-1 rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown/30 focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
        />
        <div className="flex shrink-0 overflow-hidden rounded-xl ring-1 ring-brown/10">
          <button
            type="button"
            onClick={() => onLunarChange(false)}
            aria-pressed={!isLunar}
            className={`px-3 text-xs font-semibold transition ${
              !isLunar ? "bg-coral text-white" : "bg-cream text-brown-soft hover:bg-apricot"
            }`}
          >
            양력
          </button>
          <button
            type="button"
            onClick={() => onLunarChange(true)}
            aria-pressed={isLunar}
            className={`px-3 text-xs font-semibold transition ${
              isLunar ? "bg-coral text-white" : "bg-cream text-brown-soft hover:bg-apricot"
            }`}
          >
            음력
          </button>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-brown-soft/40">숫자 8자리로 입력해주세요 (예: 19920615)</p>
      {isLunar && onLeapMonthChange && (
        <label className="mt-1.5 flex items-center gap-1.5 text-xs text-brown-soft">
          <input
            type="checkbox"
            checked={isLeapMonth ?? false}
            onChange={(e) => onLeapMonthChange(e.target.checked)}
            className="h-4 w-4 rounded border-brown/20 accent-coral"
          />
          윤달이에요
        </label>
      )}
    </div>
  );
}
