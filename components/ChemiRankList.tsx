import type { EntryDoc } from "@/lib/types";
import { AFFINITY_BANK } from "@/lib/result-engine/affinity";
import { ELEMENT_BANK } from "@/lib/result-engine/elements";
import ElementIcon from "./ElementIcon";

export default function ChemiRankList({ entries }: { entries: EntryDoc[] }) {
  if (entries.length === 0) return null;

  const ranked = [...entries].sort((a, b) => b.affinityScore - a.affinityScore);

  return (
    <div className="w-full max-w-md">
      <h2 className="text-center text-sm font-semibold text-amber-900/50">케미 랭킹 · 잘 맞는 순</h2>
      <div className="mt-3 space-y-2">
        {ranked.map((entry, i) => {
          const affinity = AFFINITY_BANK[entry.affinityCategory];
          const element = ELEMENT_BANK[entry.visitorElement];
          return (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-amber-900/5"
            >
              <span className="mt-2 w-4 shrink-0 text-center text-sm font-extrabold text-amber-900/25">
                {i + 1}
              </span>
              <ElementIcon element={entry.visitorElement} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-bold text-amber-950">{entry.visitorName}</span>
                  <span className="text-xs text-amber-900/40">{entry.seasonType}</span>
                  <span className="ml-auto shrink-0 rounded-full bg-amber-900 px-2 py-0.5 text-[11px] font-bold text-white">
                    케미 {entry.affinityScore}
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-amber-700">
                  {affinity.emoji} {affinity.label} · {element.label}({element.hanja})
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-900/60">{entry.resultAffinityBlurb}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
