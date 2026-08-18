import type { EntryDoc } from "@/lib/types";
import { ANIMAL_BANK } from "@/lib/result-engine/animals";

export default function EntryGallery({ entries }: { entries: EntryDoc[] }) {
  if (entries.length === 0) {
    return (
      <div className="mt-4 rounded-2xl bg-white/60 px-4 py-8 text-center ring-1 ring-amber-900/5">
        <div className="text-3xl">🗺️</div>
        <p className="mt-2 text-sm text-amber-900/50">
          아직 아무도 이름을 올리지 않았어요.
          <br />
          첫 번째 사람이 되어보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {entries.map((entry) => {
        const animal = ANIMAL_BANK[entry.visitorZodiac];
        return (
          <div
            key={entry.id}
            className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-amber-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-2xl">{animal.emoji}</span>
            <span className="mt-1 text-sm font-semibold text-amber-950">{entry.visitorName}</span>
            <span className="text-xs text-amber-900/40">{animal.label}</span>
          </div>
        );
      })}
    </div>
  );
}
