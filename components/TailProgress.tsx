"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress, TAIL_THRESHOLDS, type FoxProgress } from "@/lib/progress";
import { onProgressChanged } from "@/lib/notify";

function captionFor(progress: FoxProgress): string {
  if (progress.tails >= 9) return "구미호 완성 ✨";
  const today = new Date().toISOString().slice(0, 10);
  if (progress.lastDailyDate !== today) return "오늘의 기운을 보면 꼬리가 자라요 🌙";
  const nextThreshold = TAIL_THRESHOLDS[Math.min(progress.tails + 1, 9)];
  const remaining = Math.max(0, nextThreshold - progress.exp);
  return `다음 꼬리까지 ${remaining}만큼 남았어요`;
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

  const tails = progress.tails;
  const prevThreshold = TAIL_THRESHOLDS[tails];
  const nextThreshold = TAIL_THRESHOLDS[Math.min(tails + 1, 9)];
  const span = Math.max(1, nextThreshold - prevThreshold);
  const ratio = tails >= 9 ? 1 : Math.min(1, (progress.exp - prevThreshold) / span);

  return (
    <Link
      href="/collection"
      className="mx-auto flex w-full max-w-[480px] items-center gap-3 px-6 pt-3 transition active:scale-[0.99]"
    >
      <span className="shrink-0 text-3xl">🦊</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-coral-dark">꼬리 x{tails}</span>
          <span className="text-brown-soft/40">부적함 👝</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brown/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-coral to-lavender transition-all"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
        <p className="mt-0.5 truncate text-[10px] text-brown-soft/40">{captionFor(progress)}</p>
      </div>
    </Link>
  );
}
