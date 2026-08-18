import ElementIcon from "./ElementIcon";
import type { ElementKey } from "@/lib/result-engine/elements";

interface ResultCardProps {
  title: string;
  element: ElementKey;
  elementBlurb: string;
  relationshipBlurb: string;
}

export default function ResultCard({ title, element, elementBlurb, relationshipBlurb }: ResultCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-amber-100 to-orange-100 p-6 text-center shadow-inner ring-1 ring-amber-900/10">
      <div className="flex justify-center">
        <ElementIcon element={element} size={64} />
      </div>
      <p className="mt-3 text-lg font-extrabold leading-snug text-amber-950">{title}</p>
      <p className="mt-4 text-sm leading-relaxed text-amber-900/70">{elementBlurb}</p>
      <p className="mt-2 text-sm leading-relaxed text-amber-900/70">{relationshipBlurb}</p>
    </div>
  );
}
