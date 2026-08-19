"use client";

import { useState } from "react";
import ElementIcon from "@/components/ElementIcon";
import ElementDistributionChart from "@/components/ElementDistributionChart";
import MockPayGate from "@/components/MockPayGate";
import FoxMascot from "@/components/FoxMascot";
import { addActivity } from "@/lib/localActivity";
import {
  calculateElementProfile,
  describeDistribution,
  pickVariant,
  ELEMENT_BANK,
  type ElementKey,
} from "@/lib/result-engine/elements";

interface SajuResult {
  dominant: ElementKey;
  teaser: string;
  blurb: string;
  distribution: Record<ElementKey, number>;
  distributionBlurb: string;
  pillarText: string;
  hasTimeInput: boolean;
}

export default function SajuPage() {
  const [birthdate, setBirthdate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<SajuResult | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!birthdate) {
      setError("생년월일을 입력해주세요.");
      return;
    }
    setError("");

    const profile = calculateElementProfile(birthdate, birthTime || undefined);
    const element = ELEMENT_BANK[profile.dominant];
    const blurb = element.blurbs[pickVariant(`${birthdate}-${birthTime}-saju`, element.blurbs.length)];
    const teaser = blurb.split(".")[0] + ".";

    setResult({
      dominant: profile.dominant,
      teaser,
      blurb,
      distribution: profile.distribution,
      distributionBlurb: describeDistribution(profile.distribution),
      pillarText: profile.pillarText,
      hasTimeInput: profile.hasTimeInput,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="scroll" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">내 사주 풀이</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft/60">
        생년월일(시)를 넣으면 복실이가 사주를 풀어드려요
      </p>

      {!result ? (
        <form
          onSubmit={handleSubmit}
          className="mt-8 w-full space-y-5 rounded-3xl bg-white p-6 shadow-xl shadow-brown/5 ring-1 ring-brown/5"
        >
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brown">생년월일</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brown">
              출생 시간 <span className="font-normal text-brown/40">(선택, 모르면 비워두세요)</span>
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
          </div>
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-b from-coral to-coral-dark py-3.5 text-sm font-bold text-white shadow-lg shadow-coral-dark/25 transition active:scale-95 hover:brightness-105"
          >
            풀이 보기 (요약 무료)
          </button>
        </form>
      ) : (
        <div className="mt-8 w-full rounded-2xl bg-gradient-to-b from-apricot to-cream p-6 text-center shadow-inner ring-1 ring-brown/10">
          <div className="flex justify-center">
            <ElementIcon element={result.dominant} size={64} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-brown-soft/70">{result.teaser}</p>

          <MockPayGate
            priceKrw={990}
            onUnlock={() =>
              addActivity({
                category: "내 사주 풀이",
                title: `${ELEMENT_BANK[result.dominant].label}(${ELEMENT_BANK[result.dominant].hanja}) 기운 상세 풀이`,
                priceKrw: 990,
              })
            }
          >
            <div className="mt-5 space-y-3 rounded-xl bg-white/60 p-4 text-left">
              <p className="text-center text-xs font-semibold text-brown-soft/50">
                사주 상세 · {result.hasTimeInput ? "출생시간 포함" : "출생시간 미입력 (참고용)"}
              </p>
              <p className="text-center text-xs text-brown-soft/70">{result.pillarText}</p>
              <ElementDistributionChart distribution={result.distribution} />
              <p className="text-sm leading-relaxed text-brown-soft/70">{result.blurb}</p>
              <p className="text-sm leading-relaxed text-brown-soft/70">{result.distributionBlurb}</p>
            </div>
          </MockPayGate>

          <button
            type="button"
            onClick={() => setResult(null)}
            className="mt-4 text-xs font-semibold text-brown-soft/50 underline underline-offset-2"
          >
            다시 입력하기
          </button>
        </div>
      )}
    </div>
  );
}
