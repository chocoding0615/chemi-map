import { MBTI_ADVICE } from "@/lib/content/mbtiAdvice";
import { pickVariant } from "@/lib/result-engine/elements";
import type { MbtiType } from "@/lib/result-engine/temperament";

interface MbtiBehaviorSectionProps {
  mbti: MbtiType;
  seed: string;
}

export default function MbtiBehaviorSection({ mbti, seed }: MbtiBehaviorSectionProps) {
  const advice = MBTI_ADVICE[mbti];
  const avoid = advice.avoid[pickVariant(`${seed}-mbti-avoid`, advice.avoid.length)];
  const embrace = advice.embrace[pickVariant(`${seed}-mbti-embrace`, advice.embrace.length)];

  return (
    <div className="mt-4 rounded-xl bg-white/60 p-4 text-left">
      <p className="text-xs font-semibold text-brown-soft/50">{mbti} 성격으로 보는 행동 조언</p>
      <div className="mt-3 space-y-2">
        <div className="rounded-lg bg-cream/60 p-3">
          <p className="text-xs font-bold text-coral-dark">🙅 이런 행동은 자제해보세요</p>
          <p className="mt-1 text-sm leading-relaxed text-brown-soft/70">{avoid}</p>
        </div>
        <div className="rounded-lg bg-cream/60 p-3">
          <p className="text-xs font-bold text-mint-dark">🙆 이렇게 행동하면 좋아요</p>
          <p className="mt-1 text-sm leading-relaxed text-brown-soft/70">{embrace}</p>
        </div>
      </div>
    </div>
  );
}
