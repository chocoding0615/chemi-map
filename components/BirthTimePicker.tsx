"use client";

import { useEffect, useState } from "react";

interface BirthTimePickerProps {
  /** "HH:mm"(24시간제) 또는 모름일 때 "" — 기존 <input type="time">과 같은 포맷. */
  value: string;
  onChange: (value: string) => void;
}

type Period = "AM" | "PM";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1~12
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,...,55

function to24Hour(period: Period, hour12: number, minute: number): string {
  let hour24 = hour12 % 12;
  if (period === "PM") hour24 += 12;
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function from24Hour(value: string): { period: Period; hour12: number; minute: number } | null {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const period: Period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { period, hour12, minute: m };
}

const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-brown/10 bg-cream px-2 py-2.5 text-center text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30";

// "모름"은 별도 옵션이 아니라 세 select 중 하나라도 비어있으면 자동으로 그 상태가
// 된다 — 기존 <input type="time">을 비워두는 것과 같은 사용자 경험이라 자연스럽다.
export default function BirthTimePicker({ value, onChange }: BirthTimePickerProps) {
  const [period, setPeriod] = useState<Period | "">("");
  const [hour, setHour] = useState<number | "">("");
  const [minute, setMinute] = useState<number | "">("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const parsed = from24Hour(value);
    if (!parsed) {
      setPeriod("");
      setHour("");
      setMinute("");
      return;
    }
    setPeriod(parsed.period);
    setHour(parsed.hour12);
    setMinute(parsed.minute);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [value]);

  function emit(p: Period | "", h: number | "", m: number | "") {
    if (p && h && m !== "") {
      onChange(to24Hour(p, h, m));
    } else {
      onChange("");
    }
  }

  function handlePeriod(raw: string) {
    const p = (raw as Period) || "";
    setPeriod(p);
    emit(p, hour, minute);
  }

  function handleHour(raw: string) {
    const h = raw ? Number(raw) : "";
    setHour(h);
    emit(period, h, minute);
  }

  function handleMinute(raw: string) {
    const m = raw === "" ? "" : Number(raw);
    setMinute(m);
    emit(period, hour, m);
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <select value={period} onChange={(e) => handlePeriod(e.target.value)} className={SELECT_CLASS}>
        <option value="">모름</option>
        <option value="AM">오전</option>
        <option value="PM">오후</option>
      </select>
      <select value={hour} onChange={(e) => handleHour(e.target.value)} className={SELECT_CLASS}>
        <option value="">시</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}시{h === 12 ? (period === "AM" ? "(자정)" : period === "PM" ? "(정오)" : "") : ""}
          </option>
        ))}
      </select>
      <select value={minute} onChange={(e) => handleMinute(e.target.value)} className={SELECT_CLASS}>
        <option value="">분</option>
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}분
          </option>
        ))}
      </select>
    </div>
  );
}
