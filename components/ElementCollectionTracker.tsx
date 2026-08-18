import { ELEMENT_ORDER, type ElementKey } from "@/lib/result-engine/elements";
import ElementIcon from "./ElementIcon";

export default function ElementCollectionTracker({ unlockedKeys }: { unlockedKeys: ElementKey[] }) {
  const unlockedSet = new Set(unlockedKeys);
  const allUnlocked = unlockedSet.size === ELEMENT_ORDER.length;

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-amber-900/5">
      <p className="text-center text-xs font-semibold text-amber-900/50">
        {allUnlocked ? "오행을 모두 채웠어요! 🎉" : "오행 5개를 모두 채워보세요"}
      </p>
      <div className="mt-2 flex justify-center gap-3">
        {ELEMENT_ORDER.map((key) => (
          <div key={key} className={unlockedSet.has(key) ? "" : "opacity-25 grayscale"}>
            <ElementIcon element={key} size={32} />
          </div>
        ))}
      </div>
    </div>
  );
}
