import { ELEMENT_BANK, ELEMENT_ORDER, type ElementKey } from "@/lib/result-engine/elements";

export default function ElementDistributionChart({
  distribution,
}: {
  distribution: Record<ElementKey, number>;
}) {
  const max = Math.max(1, ...ELEMENT_ORDER.map((key) => distribution[key]));

  return (
    <div className="space-y-1.5">
      {ELEMENT_ORDER.map((key) => {
        const entry = ELEMENT_BANK[key];
        const count = distribution[key];
        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="w-12 shrink-0 text-brown-soft">
              {entry.label}({entry.hanja})
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-brown/10">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(count / max) * 100}%`, backgroundColor: entry.color }}
              />
            </div>
            <span className="w-3 shrink-0 text-right text-brown-soft/50">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
