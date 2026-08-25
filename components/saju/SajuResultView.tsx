"use client";

import type { RefObject } from "react";
import Link from "next/link";
import ElementIcon from "@/components/ElementIcon";
import ElementDistributionChart from "@/components/ElementDistributionChart";
import MockPayGate from "@/components/MockPayGate";
import TodayScoreCard from "@/components/TodayScoreCard";
import SajuDetailReport from "@/components/SajuDetailReport";
import MbtiBehaviorSection from "@/components/MbtiBehaviorSection";
import SajuLlmReportSection from "@/components/SajuLlmReportSection";
import LuckyGrid from "@/components/saju/LuckyGrid";
import AccessBadge from "@/components/common/AccessBadge";
import { SAJU_SUMMARY_PRICE_KRW } from "@/lib/pricing";
import { FORTUNE_FREE_PREVIEW } from "@/lib/config";
import { ELEMENT_BANK } from "@/lib/result-engine/elements";
import type { SajuResult } from "@/hooks/useSajuForm";

interface SajuResultViewProps {
  result: SajuResult;
  resultRef: RefObject<HTMLDivElement | null>;
  onReset: () => void;
}

export default function SajuResultView({ result, resultRef, onReset }: SajuResultViewProps) {
  return (
    <div ref={resultRef} className="mt-8 w-full space-y-4 scroll-mt-6">
      {/* 핵심 결론(오행 아이콘+티저)이 스크롤 없이 첫 화면에 보이도록 사주 요약을 가장 먼저 둔다 —
          TodayScoreCard는 부가 콘텐츠라 그 아래로 옮겼다(여우.md UI/UX Phase B). */}
      <div className="w-full rounded-2xl bg-gradient-to-b from-apricot to-cream p-6 text-center shadow-inner ring-1 ring-brown/10">
        <div className="flex justify-center">
          <ElementIcon element={result.dominant} size={64} />
        </div>
        {result.name && <p className="mt-2 text-sm font-bold text-coral-dark">{result.name}님의 사주예요</p>}
        <p className="mt-3 text-sm leading-relaxed text-brown-soft">{result.teaser}</p>
        <div className="mt-2 flex justify-center">
          <AccessBadge
            state={FORTUNE_FREE_PREVIEW ? { kind: "free" } : { kind: "price", priceKrw: SAJU_SUMMARY_PRICE_KRW }}
          />
        </div>

        <div className="mt-5">
          <TodayScoreCard />
        </div>

        <MockPayGate
          productId="saju-summary"
          priceKrw={SAJU_SUMMARY_PRICE_KRW}
          category="내 사주 풀이"
          title={`${ELEMENT_BANK[result.dominant].label}(${ELEMENT_BANK[result.dominant].hanja}) 기운 상세 풀이`}
        >
          <div className="mt-5 space-y-4 rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-brown/10">
            <div>
              <p className="text-center text-xs font-semibold text-brown-soft/90">
                사주 상세 · {result.hasTimeInput ? "출생시간 포함" : "출생시간 미입력 (참고용)"}
              </p>
              <p className="mt-1 text-center text-xs text-brown-soft">{result.pillarText}</p>
            </div>

            <ElementDistributionChart distribution={result.distribution} />
            <p className="text-sm leading-relaxed text-brown-soft">{result.balance.strongText}</p>
            <p className="text-sm leading-relaxed text-brown-soft">{result.balance.weakText}</p>

            <div className="space-y-3 border-t border-brown/10 pt-4">
              <div>
                <p className="text-xs font-bold text-coral-dark">🌱 타고난 기질</p>
                <p className="mt-1 text-sm leading-relaxed text-brown-soft">{result.personality.temperament}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-coral-dark">💞 관계·인연에서의 성향</p>
                <p className="mt-1 text-sm leading-relaxed text-brown-soft">{result.personality.relationships}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-coral-dark">🌤️ 일·성장에서의 성향</p>
                <p className="mt-1 text-sm leading-relaxed text-brown-soft">{result.personality.growth}</p>
              </div>
            </div>

            <div className="rounded-lg bg-mint/15 p-3">
              <p className="text-xs font-bold text-mint-dark">💡 복실이의 조언</p>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft">{result.advice}</p>
            </div>
            <div className="rounded-lg bg-lavender/15 p-3">
              <p className="text-xs font-bold text-lavender-dark">⚠️ 이런 점은 조심하세요</p>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft">{result.caution}</p>
            </div>

            <LuckyGrid lucky={result.lucky} />
          </div>

          <SajuDetailReport
            label={result.name || "나"}
            birthdate={result.birthdate}
            birthTime={result.birthTime || undefined}
            gender={result.gender}
            advanced={result.advancedOptions}
          />

          {result.mbti && <MbtiBehaviorSection mbti={result.mbti} seed={`${result.birthdate}-${result.mbti}`} />}
        </MockPayGate>

        <SajuLlmReportSection
          input={{
            name: result.name || undefined,
            birthdate: result.birthdate,
            birthTime: result.birthTime || undefined,
            gender: result.gender,
            mbti: result.mbti || undefined,
          }}
        />

        <Link
          href="/today"
          className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brown/5 transition active:scale-[0.98] hover:bg-apricot/40"
        >
          <span className="text-sm font-bold text-brown">오늘 운세도 볼까요?</span>
          <span className="text-lg text-brown-soft/30">→</span>
        </Link>

        <button
          type="button"
          onClick={onReset}
          className="mt-4 text-xs font-semibold text-brown-soft/90 underline underline-offset-2"
        >
          다시 입력하기
        </button>
      </div>
    </div>
  );
}
