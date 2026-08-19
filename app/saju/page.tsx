"use client";

import { useEffect, useState } from "react";
import ElementIcon from "@/components/ElementIcon";
import ElementDistributionChart from "@/components/ElementDistributionChart";
import MockPayGate from "@/components/MockPayGate";
import FoxMascot from "@/components/FoxMascot";
import TodayScoreCard from "@/components/TodayScoreCard";
import { addActivity } from "@/lib/localActivity";
import { calculateElementProfile, ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import {
  getPersonalityReading,
  getBalanceInsight,
  getSajuAdvice,
  getSajuCaution,
  getLuckyInfo,
  type PersonalityReading,
  type BalanceInsight,
  type LuckyInfo,
} from "@/lib/result-engine/sajuReading";
import { awardForAction, markFortuneSeen } from "@/lib/foxRewards";
import { registerBackHandler } from "@/lib/backHandler";

interface SajuResult {
  dominant: ElementKey;
  teaser: string;
  distribution: Record<ElementKey, number>;
  pillarText: string;
  hasTimeInput: boolean;
  personality: PersonalityReading;
  balance: BalanceInsight;
  advice: string;
  caution: string;
  lucky: LuckyInfo;
}

export default function SajuPage() {
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [birthTime, setBirthTime] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<SajuResult | null>(null);

  useEffect(() => {
    if (!result) return;
    return registerBackHandler(() => setResult(null));
  }, [result]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!birthdate || !gender) {
      setError("생년월일과 성별을 입력해주세요.");
      return;
    }
    setError("");

    const profile = calculateElementProfile(birthdate, birthTime || undefined);
    const seed = `${birthdate}-${gender}-${birthTime}-saju`;
    const personality = getPersonalityReading(profile.dominant, seed);
    const teaser = personality.temperament.split(".")[0] + ".";

    setResult({
      dominant: profile.dominant,
      teaser,
      distribution: profile.distribution,
      pillarText: profile.pillarText,
      hasTimeInput: profile.hasTimeInput,
      personality,
      balance: getBalanceInsight(profile.distribution),
      advice: getSajuAdvice(profile.dominant, seed),
      caution: getSajuCaution(profile.dominant, seed),
      lucky: getLuckyInfo(profile.dominant),
    });
    awardForAction("saju");
    markFortuneSeen("saju");
  }

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="scroll" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">내 사주 풀이</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft/60">
        생년월일·성별·태어난 시간을 넣으면 복실이가 사주를 풀어드려요
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
            <label className="mb-1.5 block text-sm font-semibold text-brown">성별</label>
            <div className="grid grid-cols-2 gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition active:scale-95 ${
                    gender === g
                      ? "bg-gradient-to-b from-coral to-coral-dark text-white shadow-md shadow-coral-dark/25"
                      : "bg-cream text-brown-soft/70 ring-1 ring-brown/10 hover:bg-apricot"
                  }`}
                >
                  {g === "male" ? "남자" : "여자"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brown">
              태어난 시간 <span className="font-normal text-brown/40">(선택, 모르면 비워두세요)</span>
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
            풀이 보기
          </button>
        </form>
      ) : (
        <div className="mt-8 w-full space-y-4">
          <TodayScoreCard />

          <div className="w-full rounded-2xl bg-gradient-to-b from-apricot to-cream p-6 text-center shadow-inner ring-1 ring-brown/10">
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
              <div className="mt-5 space-y-4 rounded-xl bg-white/60 p-4 text-left">
                <div>
                  <p className="text-center text-xs font-semibold text-brown-soft/50">
                    사주 상세 · {result.hasTimeInput ? "출생시간 포함" : "출생시간 미입력 (참고용)"}
                  </p>
                  <p className="mt-1 text-center text-xs text-brown-soft/70">{result.pillarText}</p>
                </div>

                <ElementDistributionChart distribution={result.distribution} />
                <p className="text-sm leading-relaxed text-brown-soft/70">{result.balance.strongText}</p>
                <p className="text-sm leading-relaxed text-brown-soft/70">{result.balance.weakText}</p>

                <div className="space-y-3 border-t border-brown/10 pt-4">
                  <div>
                    <p className="text-xs font-bold text-coral-dark">🌱 타고난 기질</p>
                    <p className="mt-1 text-sm leading-relaxed text-brown-soft/70">{result.personality.temperament}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-coral-dark">💞 관계·인연에서의 성향</p>
                    <p className="mt-1 text-sm leading-relaxed text-brown-soft/70">{result.personality.relationships}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-coral-dark">🌤️ 일·성장에서의 성향</p>
                    <p className="mt-1 text-sm leading-relaxed text-brown-soft/70">{result.personality.growth}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-mint/15 p-3">
                  <p className="text-xs font-bold text-mint-dark">💡 복실이의 조언</p>
                  <p className="mt-1 text-sm leading-relaxed text-brown-soft/70">{result.advice}</p>
                </div>
                <div className="rounded-lg bg-lavender/15 p-3">
                  <p className="text-xs font-bold text-lavender-dark">⚠️ 이런 점은 조심하세요</p>
                  <p className="mt-1 text-sm leading-relaxed text-brown-soft/70">{result.caution}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-cream p-2">
                    <p className="font-bold text-coral-dark">행운의 색</p>
                    <p className="mt-0.5 text-brown-soft/70">{result.lucky.color}</p>
                  </div>
                  <div className="rounded-lg bg-cream p-2">
                    <p className="font-bold text-coral-dark">행운의 아이템</p>
                    <p className="mt-0.5 text-brown-soft/70">{result.lucky.item}</p>
                  </div>
                  <div className="rounded-lg bg-cream p-2">
                    <p className="font-bold text-coral-dark">행운의 방향</p>
                    <p className="mt-0.5 text-brown-soft/70">{result.lucky.direction}</p>
                  </div>
                  <div className="rounded-lg bg-cream p-2">
                    <p className="font-bold text-coral-dark">잘 맞는 시간대</p>
                    <p className="mt-0.5 text-brown-soft/70">{result.lucky.time}</p>
                  </div>
                </div>
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
        </div>
      )}
    </div>
  );
}
