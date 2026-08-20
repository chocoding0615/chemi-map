"use client";

import { useEffect, useState } from "react";

interface BirthDatePickerProps {
  /** "YYYY-MM-DD" 또는 미입력 시 "" — 기존 <input type="date">와 같은 포맷. */
  value: string;
  onChange: (value: string) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
// 최신 연도부터 1930년까지 역순 — 생년월일 선택은 최근 연도를 먼저 보여주는 게 더 빠르다.
const YEARS = Array.from({ length: CURRENT_YEAR - 1930 + 1 }, (_, i) => CURRENT_YEAR - i);
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
    const y = raw ? Number(raw) : "";
    const d = y && month && day && day > daysInMonth(y, month) ? daysInMonth(y, month) : day;
    setYear(y);
    setDay(d);
    emit(y, month, d);
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
      <select value={year} onChange={(e) => handleYear(e.target.value)} className={SELECT_CLASS}>
        <option value="">년</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
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
