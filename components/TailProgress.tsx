"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress, deriveTailState, type FoxProgress } from "@/lib/progress";
import { onProgressChanged } from "@/lib/notify";

function captionFor(progress: FoxProgress, tails: number, remain: number): string {
  if (tails >= 9) return "구미호 완성 ✨";
  const today = new Date().toISOString().slice(0, 10);
  if (progress.lastDailyDate !== today) return "오늘의 기운을 보면 꼬리가 자라요 🌙";
  return `다음 꼬리까지 ${remain}만큼 남았어요`;
}

export default function TailProgress() {
  const [progress, setProgress] = useState<FoxProgress | null>(null);

  useEffect(() => {
    function refresh() {
      setProgress(getProgress());
    }
    // 서버 렌더와의 하이드레이션 불일치를 피하려고 마운트 후에만 localStorage를 읽는다.
    refresh();
    return onProgressChanged(refresh);
  }, []);

  if (!progress) {
    return <div className="mx-auto h-14 w-full max-w-[480px]" />;
  }

  const { tails, pct, remain } = deriveTailState(progress.exp);

  return (
    <div className="mx-auto flex w-full max-w-[480px] items-center gap-3 px-6 pt-3">
      <span className="shrink-0 text-3xl">🦊</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-coral-dark">꼬리 x{tails}</span>
          <Link
            href="/my?tab=collection"
            aria-label="부적 주머니 보기"
            className="text-brown-soft/40 transition active:scale-95 hover:text-brown-soft"
          >
            부적함 👝
          </Link>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brown/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-coral to-lavender transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-0.5 truncate text-[10px] text-brown-soft/40">{captionFor(progress, tails, remain)}</p>
      </div>
    </div>
  );
}
