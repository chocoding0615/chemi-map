import type { EntryDoc } from "@/lib/types";
import { ANIMAL_BANK } from "@/lib/result-engine/animals";

export default function EntryGallery({ entries }: { entries: EntryDoc[] }) {
  if (entries.length === 0) {
    return (
      <p className="mt-6 text-center text-sm text-neutral-400">
        아직 아무도 이름을 올리지 않았어요. 첫 번째 사람이 되어보세요!
      </p>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {entries.map((entry) => {
        const animal = ANIMAL_BANK[entry.visitorZodiac];
        return (
          <div
            key={entry.id}
            className="flex flex-col items-center rounded-xl border border-neutral-200 bg-white p-3 text-center"
          >
            <span className="text-2xl">{animal.emoji}</span>
            <span className="mt-1 text-sm font-medium text-neutral-800">{entry.visitorName}</span>
            <span className="text-xs text-neutral-400">{animal.label}</span>
          </div>
        );
      })}
    </div>
  );
}
