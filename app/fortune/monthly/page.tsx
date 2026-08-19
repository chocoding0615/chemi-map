"use client";

import { useEffect, useState } from "react";
import FoxMascot from "@/components/FoxMascot";
import ElementIcon from "@/components/ElementIcon";
import { getMonthlyFortune } from "@/lib/result-engine/monthlyFortune";
import { getStoredBirthdate, setStoredBirthdate, clearStoredBirthdate } from "@/lib/dailyPersonalization";

export default function MonthlyFortunePage() {
  const [birthdate, setBirthdate] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // 서버 렌더와의 하이드레이션 불일치를 피하려고 마운트 후에만 localStorage를 읽는다.
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = getStoredBirthdate();
    if (stored) {
      setBirthdate(stored);
      setInputValue(stored);
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue) return;
    setStoredBirthdate(inputValue);
    setBirthdate(inputValue);
  }

  function handleClear() {
    clearStoredBirthdate();
    setBirthdate(null);
    setInputValue("");
  }

  const monthISO = new Date().toISOString().slice(0, 7);
  const fortune = hydrated ? getMonthlyFortune(birthdate, monthISO) : null;

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">이달의 기운</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft/60">
        매달 새로 바뀌는 무료 운세예요
      </p>

      {!hydrated || !fortune ? (
        <div className="mt-8 h-40 w-full animate-pulse rounded-3xl bg-white/60" />
      ) : (
        <>
          <div className="mt-8 w-full rounded-2xl bg-gradient-to-b from-apricot to-cream p-6 text-center shadow-inner ring-1 ring-brown/10">
            {fortune.element && (
              <div className="flex justify-center">
                <ElementIcon element={fortune.element} size={56} />
              </div>
            )}
            <p className="mt-3 text-sm leading-relaxed text-brown-soft/70">{fortune.text}</p>
          </div>

          <form
            onSubmit={handleSave}
            className="mt-6 w-full space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brown/5"
          >
            <label className="block text-sm font-semibold text-brown">
              생일을 넣으면 나만의 기운으로 볼 수 있어요{" "}
              <span className="font-normal text-brown/40">(선택)</span>
            </label>
            <input
              type="date"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-b from-mint to-mint-dark py-2.5 text-sm font-bold text-white shadow-md shadow-mint-dark/25 transition active:scale-95"
              >
                저장하고 보기
              </button>
              {birthdate && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-xl bg-cream px-4 py-2.5 text-sm font-semibold text-brown-soft/60 ring-1 ring-brown/10 transition active:scale-95"
                >
                  초기화
                </button>
              )}
            </div>
            <p className="text-[11px] text-brown-soft/40">
              이 브라우저에만 저장돼요 · 오늘의 기운과 같은 생일을 사용해요
            </p>
          </form>
        </>
      )}
    </div>
  );
}
