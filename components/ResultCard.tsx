interface ResultCardProps {
  title: string;
  animalBlurb: string;
  relationshipBlurb: string;
}

export default function ResultCard({ title, animalBlurb, relationshipBlurb }: ResultCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-amber-100 to-orange-100 p-6 text-center shadow-inner ring-1 ring-amber-900/10">
      <p className="text-lg font-extrabold leading-snug text-amber-950">{title}</p>
      <p className="mt-4 text-sm leading-relaxed text-amber-900/70">{animalBlurb}</p>
      <p className="mt-2 text-sm leading-relaxed text-amber-900/70">{relationshipBlurb}</p>
    </div>
  );
}
