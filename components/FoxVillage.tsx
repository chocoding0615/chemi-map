"use client";

import { useEffect, useState } from "react";
import { getProgress, deriveTailState, type FoxProgress } from "@/lib/progress";
import { onProgressChanged } from "@/lib/notify";
import { VILLAGE_ITEMS } from "@/lib/content/villageItems";

export default function FoxVillage() {
  const [progress, setProgress] = useState<FoxProgress | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<Set<string> | null>(null);
  const [inviteMessage, setInviteMessage] = useState(false);

  useEffect(() => {
    function refresh() {
      setProgress(getProgress());
    }
    // 서버 렌더와의 하이드레이션 불일치를 피하려고 마운트 후에만 localStorage를 읽는다.
    refresh();
    return onProgressChanged(refresh);
  }, []);

  useEffect(() => {
    // 최초 1회, 실제 꼬리 수를 기준으로 초기 unlock 세트를 만든다 —
    // TODO: 지금은 "앞에서부터 N개"라는 임시 규칙이고, 실제로는 요소별 조건으로 대체될 예정.
    if (!progress || unlockedIds) return;
    const { tails } = deriveTailState(progress.exp);
    const capacity = Math.min(VILLAGE_ITEMS.length, 2 + tails * 2);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- progress 로드 후 1회만 초기화
    setUnlockedIds(new Set(VILLAGE_ITEMS.slice(0, capacity).map((item) => item.id)));
  }, [progress, unlockedIds]);

  function toggleItem(id: string) {
    // 지금은 테스트용 수동 토글 — TODO: 실제로는 progress/charms 조건 충족 시 자동으로 unlock.
    setUnlockedIds((prev) => {
      const next = new Set(prev ?? []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleInvite() {
    // TODO: 실제 초대 링크 생성·공유는 lib/myMap.ts + ShareBanner 패턴과 연결해서
    // "친구가 링크로 들어와 놀러가면 손님 여우가 마을에 추가된다"로 완성할 예정.
    setInviteMessage(true);
    setTimeout(() => setInviteMessage(false), 3000);
  }

  if (!progress || !unlockedIds) {
    return <div className="mt-8 h-80 w-full animate-pulse rounded-3xl bg-white/60" />;
  }

  const { tails, pct, remain, isMax } = deriveTailState(progress.exp);
  const capacity = Math.min(VILLAGE_ITEMS.length, 2 + tails * 2);
  const unlockedCount = unlockedIds.size;

  return (
    <div className="mt-8 w-full">
      <div className="rounded-2xl bg-white/70 px-4 py-3 text-center shadow-sm ring-1 ring-brown/5">
        <p className="text-lg font-bold text-coral-dark" style={{ fontFamily: "var(--font-hand)" }}>
          🦊 &ldquo;여기 우리 마을이야! 하나씩 채워보자&rdquo;
        </p>
      </div>

      <div
        className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-brown/10"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 40%, #fffaf3 0%, #fff1e0 60%, #ffe3c4 100%)",
        }}
      >
        {VILLAGE_ITEMS.map((item) => {
          const unlocked = unlockedIds.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              aria-label={unlocked ? item.label : `잠긴 자리 · ${item.label}`}
              className="absolute flex flex-col items-center transition active:scale-90"
              style={{ left: `${item.x}%`, top: `${item.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <span className={`text-2xl ${unlocked ? "" : "opacity-20 grayscale"}`}>
                {unlocked ? item.emoji : "❔"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-brown-soft/90">
        <span>
          마을 {unlockedCount}/{VILLAGE_ITEMS.length} 채움
        </span>
        <span className="font-bold text-coral-dark">꼬리 x{tails}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brown/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-coral to-lavender transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-brown-soft/40">
        {isMax
          ? "구미호 완성 ✨ · 마을 자리도 전부 열렸어요"
          : `다음 꼬리까지 ${remain}만큼 남았어요 · 지금 열 수 있는 자리 ${capacity}/${VILLAGE_ITEMS.length}`}
      </p>

      <button
        type="button"
        onClick={handleInvite}
        className="mt-4 w-full rounded-xl bg-gradient-to-b from-coral to-coral-dark py-3 text-sm font-bold text-white shadow-md shadow-coral-dark/25 transition active:scale-95"
      >
        친구 초대하기
      </button>
      {inviteMessage && (
        <p className="mt-2 text-center text-xs leading-relaxed text-coral-dark">
          친구가 놀러 오면 마을에 손님 여우가 나타나고, 꼬리 성장에도 도움이 돼요! (연결 준비 중)
        </p>
      )}

      <p className="mt-3 text-center text-[10px] text-brown-soft/30">
        자리를 눌러보면 잠금 해제를 미리 볼 수 있어요 (테스트용)
      </p>
    </div>
  );
}
