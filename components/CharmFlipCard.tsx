interface CharmFlipCardProps {
  emoji: string;
  revealed: boolean;
}

export default function CharmFlipCard({ emoji, revealed }: CharmFlipCardProps) {
  return (
    <div className="mx-auto" style={{ perspective: "800px" }}>
      <div
        className="relative h-40 w-32 transition-transform duration-500 motion-reduce:duration-0"
        style={{ transformStyle: "preserve-3d", transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-b from-coral to-coral-dark text-4xl shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          🦊
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white text-5xl shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {emoji}
        </div>
      </div>
    </div>
  );
}
