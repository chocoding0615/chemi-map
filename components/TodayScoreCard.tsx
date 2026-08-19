"use client";

import { useEffect, useState } from "react";
import { getTodayScore } from "@/lib/result-engine/todayScore";

interface TodayScoreCardProps {
  birthdate: string | null;
}

const CATEGORY_META = [
  { key: "love", label: "애정운", emoji: "💕" },
  { key: "wealth", label: "재물운", emoji: "💰" },
  { key: "career", label: "직업운", emoji: "💼" },
  { key: "health", label: "건강운", emoji: "🍃" },
] as const;

export default function TodayScoreCard({ birthdate }: TodayScoreCardProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // 서버 렌더와의 하이드레이션 불일치를 피하려고 마운트 후에만 오늘 날짜를 계산한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <div className="h-56 w-full animate-pulse rounded-2xl bg-white/60" />;
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  const score = getTodayScore(birthdate, todayISO);

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brown/5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-brown">🦊 오늘의 운세 점수</p>
        <span className="text-2xl font-extrabold text-coral-dark">
          {score.overall}
          <span className="text-xs font-semibold text-brown-soft/40">/100</span>
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-brown-soft/60">{score.comment}</p>

      <div className="mt-4 space-y-2">
        {CATEGORY_META.map((c) => (
          <div key={c.key} className="flex items-center gap-2 text-xs">
            <span className="w-16 shrink-0 text-brown-soft/60">
              {c.emoji} {c.label}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brown/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-coral to-lavender transition-all"
                style={{ width: `${score.detail[c.key]}%` }}
              />
            </div>
            <span className="w-7 shrink-0 text-right font-semibold text-brown-soft/50">
              {score.detail[c.key]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
        <div className="rounded-lg bg-cream p-2">
          <p className="font-bold text-coral-dark">오늘의 색</p>
          <p className="mt-0.5 text-brown-soft/70">{score.luckyColor}</p>
        </div>
        <div className="rounded-lg bg-cream p-2">
          <p className="font-bold text-coral-dark">오늘의 아이템</p>
          <p className="mt-0.5 text-brown-soft/70">{score.luckyItem}</p>
        </div>
        <div className="rounded-lg bg-cream p-2">
          <p className="font-bold text-coral-dark">오늘의 방향</p>
          <p className="mt-0.5 text-brown-soft/70">{score.luckyDirection}</p>
        </div>
      </div>
    </div>
  );
}
