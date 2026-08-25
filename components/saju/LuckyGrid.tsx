import type { LuckyInfo } from "@/lib/result-engine/sajuReading";

export default function LuckyGrid({ lucky }: { lucky: LuckyInfo }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-center text-xs">
      <div className="rounded-lg bg-cream p-2">
        <p className="font-bold text-coral-dark">행운의 색</p>
        <p className="mt-0.5 text-brown-soft">{lucky.color}</p>
      </div>
      <div className="rounded-lg bg-cream p-2">
        <p className="font-bold text-coral-dark">행운의 아이템</p>
        <p className="mt-0.5 text-brown-soft">{lucky.item}</p>
      </div>
      <div className="rounded-lg bg-cream p-2">
        <p className="font-bold text-coral-dark">행운의 방향</p>
        <p className="mt-0.5 text-brown-soft">{lucky.direction}</p>
      </div>
      <div className="rounded-lg bg-cream p-2">
        <p className="font-bold text-coral-dark">잘 맞는 시간대</p>
        <p className="mt-0.5 text-brown-soft">{lucky.time}</p>
      </div>
    </div>
  );
}
