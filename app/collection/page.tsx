"use client";

import { useEffect, useState } from "react";
import FoxMascot from "@/components/FoxMascot";
import { CHARMS, getOwnedCharmIds, type Rarity } from "@/lib/charms";

const RARITY_LABEL: Record<Rarity, string> = { common: "커먼", rare: "레어", epic: "에픽" };
const RARITY_BADGE: Record<Rarity, string> = {
  common: "bg-brown/10 text-brown-soft/60",
  rare: "bg-lavender/30 text-lavender-dark",
  epic: "bg-coral/25 text-coral-dark",
};

export default function CollectionPage() {
  const [owned, setOwned] = useState<string[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // 서버 렌더와의 하이드레이션 불일치를 피하려고 마운트 후에만 localStorage를 읽는다.
    /* eslint-disable react-hooks/set-state-in-effect */
    setOwned(getOwnedCharmIds());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const selected = CHARMS.find((c) => c.id === selectedId);
  const isSelectedOwned = selected ? (owned ?? []).includes(selected.id) : false;

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="heart" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">부적함</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft/60">
        여우점을 둘러보면서 복실이의 부적을 모아보세요
      </p>

      {owned === null ? (
        <div className="mt-8 h-64 w-full animate-pulse rounded-3xl bg-white/60" />
      ) : (
        <>
          <p className="mt-6 text-sm font-bold text-coral-dark">
            {owned.length}개 중 {CHARMS.length}개 모았어요
          </p>

          <div className="mt-4 grid w-full grid-cols-3 gap-3">
            {CHARMS.map((charm) => {
              const has = owned.includes(charm.id);
              return (
                <button
                  key={charm.id}
                  type="button"
                  onClick={() => setSelectedId(charm.id)}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center shadow-sm ring-1 transition active:scale-95 ${
                    has ? "bg-white ring-brown/10" : "bg-brown/5 ring-brown/5"
                  }`}
                >
                  <span className={`text-2xl ${has ? "" : "opacity-20 grayscale"}`}>{charm.emoji}</span>
                  <span className={`text-[11px] font-bold ${has ? "text-brown" : "text-brown-soft/30"}`}>
                    {has ? charm.name : "???"}
                  </span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${RARITY_BADGE[charm.rarity]}`}>
                    {RARITY_LABEL[charm.rarity]}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brown/40 px-6"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className={`text-5xl ${isSelectedOwned ? "" : "opacity-20 grayscale"}`}>{selected.emoji}</span>
            <p className="mt-3 text-lg font-extrabold text-brown">{isSelectedOwned ? selected.name : "???"}</p>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${RARITY_BADGE[selected.rarity]}`}>
              {RARITY_LABEL[selected.rarity]}
            </span>
            <p className="mt-3 text-sm leading-relaxed text-brown-soft/70">
              {isSelectedOwned ? selected.desc : selected.howTo}
            </p>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="mt-5 w-full rounded-xl bg-cream py-2.5 text-sm font-bold text-brown-soft/70 transition active:scale-95"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
