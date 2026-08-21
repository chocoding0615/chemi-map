"use client";

import { useEffect, useState } from "react";

interface BirthDatePickerProps {
  /** "YYYY-MM-DD" 또는 미입력 시 "" — 기존 <input type="date">와 같은 포맷. */
  value: string;
  onChange: (value: string) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate(); // month=1~12, day 0 = 전달의 마지막 날 => 윤년 자동 반영
}

const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-brown/10 bg-cream px-2 py-2.5 text-center text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30";

export default function BirthDatePicker({ value, onChange }: BirthDatePickerProps) {
  const [year, setYear] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [day, setDay] = useState<number | "">("");

  // 부모가 value를 외부에서 초기화(예: "다시 입력하기")하면 select들도 따라간다.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!value) {
      setYear("");
      setMonth("");
      setDay("");
      return;
    }
    const [y, m, d] = value.split("-").map(Number);
    if (y && m && d) {
      setYear(y);
      setMonth(m);
      setDay(d);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [value]);

  function emit(y: number | "", m: number | "", d: number | "") {
    if (y && m && d) {
      onChange(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    } else {
      onChange("");
    }
  }

  function handleYear(raw: string) {
    // 4자리 연도를 직접 입력할 수 있게 한 필드라, 타이핑 중간의 미완성 값("1", "19"...)도
    // 그대로 화면엔 보여주되(setYear), 유효한 연도가 완성됐을 때만 상위로 emit한다.
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 4);
    const parsedNum = digitsOnly ? Number(digitsOnly) : 0;
    setYear(digitsOnly ? parsedNum : "");

    const isCompleteYear = digitsOnly.length === 4 && parsedNum >= 1930 && parsedNum <= CURRENT_YEAR;
    if (!isCompleteYear) return;

    const d = month && day && day > daysInMonth(parsedNum, month) ? daysInMonth(parsedNum, month) : day;
    setDay(d);
    emit(parsedNum, month, d);
  }

  function handleMonth(raw: string) {
    const m = raw ? Number(raw) : "";
    const d = year && m && day && day > daysInMonth(year, m) ? daysInMonth(year, m) : day;
    setMonth(m);
    setDay(d);
    emit(year, m, d);
  }

  function handleDay(raw: string) {
    const d = raw ? Number(raw) : "";
    setDay(d);
    emit(year, month, d);
  }

  const maxDay = year && month ? daysInMonth(year, month) : 31;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-3 gap-2">
      <input
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={year}
        onChange={(e) => handleYear(e.target.value)}
        placeholder="년(예: 1995)"
        className={SELECT_CLASS}
      />
      <select value={month} onChange={(e) => handleMonth(e.target.value)} className={SELECT_CLASS}>
        <option value="">월</option>
        {MONTHS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select value={day} onChange={(e) => handleDay(e.target.value)} className={SELECT_CLASS}>
        <option value="">일</option>
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}
