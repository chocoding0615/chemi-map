interface ResultCardProps {
  title: string;
  animalBlurb: string;
  relationshipBlurb: string;
}

export default function ResultCard({ title, animalBlurb, relationshipBlurb }: ResultCardProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
      <p className="text-lg font-bold text-amber-900">{title}</p>
      <p className="mt-4 text-sm leading-relaxed text-neutral-700">{animalBlurb}</p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">{relationshipBlurb}</p>
    </div>
  );
}
