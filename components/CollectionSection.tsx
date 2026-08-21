"use client";

import { useEffect, useRef, useState } from "react";
import FoxMascot from "@/components/FoxMascot";
import { CHARMS, getOwnedCharmIds, getCharmAcquiredAt, type Rarity } from "@/lib/charms";

const RARITY_LABEL: Record<Rarity, string> = { common: "커먼", rare: "레어", epic: "에픽" };
const RARITY_DOT: Record<Rarity, string> = {
  common: "bg-rarity-common",
  rare: "bg-rarity-rare",
  epic: "bg-rarity-epic",
};

export default function CollectionSection() {
  const [owned, setOwned] = useState<string[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // 서버 렌더와의 하이드레이션 불일치를 피하려고 마운트 후에만 localStorage를 읽는다.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setOwned(getOwnedCharmIds());
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    closeButtonRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedId(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  const selected = CHARMS.find((c) => c.id === selectedId);
  const isSelectedOwned = selected ? (owned ?? []).includes(selected.id) : false;
  const ownedCount = owned?.length ?? 0;
  const allOwned = owned !== null && ownedCount === CHARMS.length;

  return (
    <div className="flex w-full flex-col items-center">
      <FoxMascot size={56} prop="heart" />
      <h2 className="mt-4 text-xl font-extrabold tracking-tight text-brown">복실이의 부적 주머니 👝</h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft">
        여우점을 둘러보면서 복실이의 부적을 모아보세요
      </p>

      {owned === null ? (
        <div className="mt-8 h-64 w-full animate-pulse rounded-3xl bg-white/60" />
      ) : (
        <>
          <div className="mt-6 w-full">
            <p className="text-center text-sm font-bold text-coral-dark">
              {allOwned ? "전부 모았어요! 대단해요 ✨" : `${ownedCount} / ${CHARMS.length}개를 모았어요`}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brown/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-coral to-lavender transition-all"
                style={{ width: `${(ownedCount / CHARMS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-5 grid w-full grid-cols-3 gap-3 md:grid-cols-4">
            {CHARMS.map((charm) => {
              const has = owned.includes(charm.id);
              return (
                <button
                  key={charm.id}
                  type="button"
                  onClick={() => setSelectedId(charm.id)}
                  className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl p-2 text-center shadow-sm ring-1 transition active:scale-95 ${
                    has ? "bg-white ring-brown/10" : "bg-brown/5 ring-brown/5"
                  }`}
                >
                  {has && <span className={`absolute right-2 top-2 h-2 w-2 rounded-full ${RARITY_DOT[charm.rarity]}`} />}
                  <span className={`text-2xl ${has ? "" : "opacity-25 grayscale"}`}>{charm.emoji}</span>
                  {!has && <span className="absolute text-lg">🔒</span>}
                  <span className={`truncate text-[11px] font-bold ${has ? "text-brown" : "text-brown-soft/30"}`}>
                    {has ? charm.name : "???"}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="charm-detail-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-brown/40 px-6"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className={`text-5xl ${isSelectedOwned ? "" : "opacity-25 grayscale"}`}>{selected.emoji}</span>
            <p id="charm-detail-title" className="mt-3 text-lg font-extrabold text-brown">
              {isSelectedOwned ? selected.name : "???"}
            </p>
            <span
              className={`mt-1 inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-brown-soft`}
            >
              <span className={`h-2 w-2 rounded-full ${RARITY_DOT[selected.rarity]}`} />
              {RARITY_LABEL[selected.rarity]}
            </span>
            {isSelectedOwned ? (
              <>
                <p className="mt-3 text-sm leading-relaxed text-brown-soft">{selected.desc}</p>
                {getCharmAcquiredAt(selected.id) && (
                  <p className="mt-2 text-[11px] text-brown-soft/40">
                    획득일 {new Date(getCharmAcquiredAt(selected.id)!).toLocaleDateString("ko-KR")}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-brown-soft/50">아직 만나지 못한 부적이에요.</p>
                <p className="mt-1 text-sm leading-relaxed text-brown-soft">{selected.howTo}</p>
              </>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setSelectedId(null)}
              className="mt-5 w-full rounded-xl bg-cream py-2.5 text-sm font-bold text-brown-soft transition active:scale-95"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
