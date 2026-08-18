"use client";

import type { EntryDoc } from "@/lib/types";
import { ELEMENT_ORDER } from "@/lib/result-engine/elements";
import ElementIcon from "./ElementIcon";

const EMPTY_SLOTS = 4;
const ROTATIONS = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2", "rotate-1"];

function scrollToForm() {
  document.getElementById("entry-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export default function StampMap({ entries, entryCount }: { entries: EntryDoc[]; entryCount: number }) {
  const unlockedCount = new Set(entries.map((e) => e.visitorElement)).size;

  return (
    <div className="w-full max-w-md rounded-3xl border-2 border-dashed border-amber-900/15 bg-white/60 p-5">
      <div className="text-center">
        <p className="text-3xl font-extrabold text-amber-950">
          {entryCount}
          <span className="ml-1 text-base font-semibold text-amber-900/50">명</span>
        </p>
        <p className="text-xs font-medium text-amber-900/50">
          이 지도를 채웠어요 · 오행 {unlockedCount}/{ELEMENT_ORDER.length} 발견
        </p>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-5">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className={`flex flex-col items-center gap-1 ${ROTATIONS[i % ROTATIONS.length]}`}
          >
            <ElementIcon element={entry.visitorElement} size={52} variant="filled" />
            <span className="max-w-[60px] truncate text-[11px] font-semibold text-amber-950">
              {entry.visitorName}
            </span>
          </div>
        ))}

        {Array.from({ length: EMPTY_SLOTS }).map((_, i) => (
          <button
            key={`empty-${i}`}
            type="button"
            onClick={scrollToForm}
            className="flex flex-col items-center gap-1"
          >
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-dashed border-amber-900/20 text-lg text-amber-900/25 transition hover:border-amber-400 hover:text-amber-500">
              +
            </span>
            <span className="text-[11px] text-amber-900/30">참여하기</span>
          </button>
        ))}
      </div>
    </div>
  );
}
