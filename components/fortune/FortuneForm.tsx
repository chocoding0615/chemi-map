"use client";

import { useState } from "react";
import ElementIcon from "@/components/ElementIcon";
import MockPayGate from "@/components/MockPayGate";
import { addActivity } from "@/lib/localActivity";
import { getCategoryBlurb, type FortuneCategory } from "@/lib/content/fortuneCategories";
import { calculateElementProfile, ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import { getAffinityCategory, AFFINITY_BANK, calculateAffinityScore } from "@/lib/result-engine/affinity";

interface FortuneFormProps {
  category: FortuneCategory;
}

type FortuneResult =
  | { kind: "single"; element: ElementKey; blurb: string }
  | { kind: "pair"; elementA: ElementKey; elementB: ElementKey; label: string; emoji: string; score: number; blurb: string };

export default function FortuneForm({ category }: FortuneFormProps) {
  const [birthdateA, setBirthdateA] = useState("");
  const [birthdateB, setBirthdateB] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<FortuneResult | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (category.inputKind === "birthdate") {
      if (!birthdateA) {
        setError("생년월일을 입력해주세요.");
        return;
      }
      setError("");
      const { dominant } = calculateElementProfile(birthdateA);
      const blurb = getCategoryBlurb(category.slug, dominant, `${birthdateA}-${category.slug}`);
      setResult({ kind: "single", element: dominant, blurb });
      return;
    }

    if (!birthdateA || !birthdateB) {
      setError("두 사람의 생년월일을 모두 입력해주세요.");
      return;
    }
    setError("");
    const elementA = calculateElementProfile(birthdateA).dominant;
    const elementB = calculateElementProfile(birthdateB).dominant;
    const affinityCategory = getAffinityCategory(elementA, elementB);
    const affinity = AFFINITY_BANK[affinityCategory];
    const score = calculateAffinityScore(affinityCategory, `${birthdateA}-${birthdateB}-${category.slug}`);
    setResult({
      kind: "pair",
      elementA,
      elementB,
      label: affinity.label,
      emoji: affinity.emoji,
      score,
      blurb: affinity.blurb(elementA, elementB),
    });
  }

  if (result) {
    return (
      <div className="mt-8 w-full rounded-2xl bg-gradient-to-b from-apricot to-cream p-6 text-center shadow-inner ring-1 ring-brown/10">
        {result.kind === "single" ? (
          <>
            <div className="flex justify-center">
              <ElementIcon element={result.element} size={64} />
            </div>
            <p className="mt-2 text-sm font-semibold text-brown-soft/50">
              {ELEMENT_BANK[result.element].label}({ELEMENT_BANK[result.element].hanja}) 기운
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center gap-2">
              <ElementIcon element={result.elementA} size={48} />
              <ElementIcon element={result.elementB} size={48} />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-brown">
                {result.emoji} {result.label}
              </span>
              <span className="inline-flex items-center rounded-full bg-coral-dark px-3 py-1 text-xs font-bold text-white">
                궁합 {result.score}
              </span>
            </div>
          </>
        )}

        <MockPayGate
          priceKrw={category.priceKrw}
          onUnlock={() =>
            addActivity({ category: category.nameKo, title: `${category.nameKo} 상세 풀이`, priceKrw: category.priceKrw })
          }
        >
          <p className="mt-4 text-left text-sm leading-relaxed text-brown-soft/70">{result.blurb}</p>
        </MockPayGate>

        <button
          type="button"
          onClick={() => setResult(null)}
          className="mt-4 text-xs font-semibold text-brown-soft/50 underline underline-offset-2"
        >
          다시 입력하기
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 w-full space-y-5 rounded-3xl bg-white p-6 shadow-xl shadow-brown/5 ring-1 ring-brown/5"
    >
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-brown">
          {category.inputKind === "twoBirthdates" ? "나의 생년월일" : "생년월일"}
        </label>
        <input
          type="date"
          value={birthdateA}
          onChange={(e) => setBirthdateA(e.target.value)}
          className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
        />
      </div>
      {category.inputKind === "twoBirthdates" && (
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-brown">상대의 생년월일</label>
          <input
            type="date"
            value={birthdateB}
            onChange={(e) => setBirthdateB(e.target.value)}
            className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
          />
        </div>
      )}
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-b from-coral to-coral-dark py-3.5 text-sm font-bold text-white shadow-lg shadow-coral-dark/25 transition active:scale-95 hover:brightness-105"
      >
        결과 보기
      </button>
    </form>
  );
}
