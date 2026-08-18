import type { EntryDoc } from "@/lib/types";
import { ELEMENT_BANK } from "@/lib/result-engine/elements";
import ElementIcon from "./ElementIcon";

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
        const element = ELEMENT_BANK[entry.visitorElement];
        return (
          <div
            key={entry.id}
            className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-amber-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <ElementIcon element={entry.visitorElement} size={40} />
            <span className="mt-1.5 text-sm font-semibold text-amber-950">{entry.visitorName}</span>
            <span className="text-xs text-amber-900/40">
              {element.label}({element.hanja})
            </span>
          </div>
        );
      })}
    </div>
  );
}
