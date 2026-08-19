"use client";

import { useState } from "react";
import ElementIcon from "@/components/ElementIcon";
import MbtiSelect from "@/components/MbtiSelect";
import MockPayGate from "@/components/MockPayGate";
import { addActivity } from "@/lib/localActivity";
import { getCategoryBlurb, type FortuneCategory } from "@/lib/content/fortuneCategories";
import { calculateElementProfile, ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import { getAffinityCategory, AFFINITY_BANK, calculateAffinityScore } from "@/lib/result-engine/affinity";
import { getFortuneDepth } from "@/lib/result-engine/depth";
import { getMbtiCompat } from "@/lib/result-engine/mbtiCompat";
import { markFortuneSeen } from "@/lib/foxRewards";
import type { FortuneSeenId } from "@/lib/progress";

interface FortuneFormProps {
  category: FortuneCategory;
}

type Gender = "male" | "female";

interface PersonInput {
  birthdate: string;
  gender: Gender | "";
  birthTime: string;
  mbti: string;
}

const EMPTY_PERSON: PersonInput = { birthdate: "", gender: "", birthTime: "", mbti: "" };

type FortuneResult =
  | {
      kind: "single";
      element: ElementKey;
      blurb: string;
      advice: string;
      caution: string;
      luckyColor: string;
      luckyItem: string;
    }
  | {
      kind: "pair";
      elementA: ElementKey;
      elementB: ElementKey;
      label: string;
      emoji: string;
      score: number;
      blurb: string;
      mbtiLabel: string;
      mbtiEmoji: string;
      mbtiBlurb: string;
      advice: string;
      caution: string;
      luckyColor: string;
      luckyItem: string;
    };

function GenderPicker({ value, onChange }: { value: Gender | ""; onChange: (g: Gender) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(["male", "female"] as const).map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={`rounded-xl py-2.5 text-sm font-semibold transition active:scale-95 ${
            value === g
              ? "bg-gradient-to-b from-coral to-coral-dark text-white shadow-md shadow-coral-dark/25"
              : "bg-cream text-brown-soft/70 ring-1 ring-brown/10 hover:bg-apricot"
          }`}
        >
          {g === "male" ? "남자" : "여자"}
        </button>
      ))}
    </div>
  );
}

function PersonFields({
  legend,
  value,
  onChange,
  showMbti,
}: {
  legend: string;
  value: PersonInput;
  onChange: (next: PersonInput) => void;
  showMbti: boolean;
}) {
  return (
    <div className="space-y-4 rounded-2xl bg-cream/60 p-4">
      <p className="text-sm font-bold text-brown">{legend}</p>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brown-soft/70">생년월일</label>
        <input
          type="date"
          value={value.birthdate}
          onChange={(e) => onChange({ ...value, birthdate: e.target.value })}
          className="w-full rounded-xl border border-brown/10 bg-white px-4 py-2.5 text-sm text-brown focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brown-soft/70">성별</label>
        <GenderPicker value={value.gender} onChange={(g) => onChange({ ...value, gender: g })} />
      </div>
      {showMbti && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brown-soft/70">MBTI</label>
          <MbtiSelect value={value.mbti} onChange={(mbti) => onChange({ ...value, mbti })} />
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brown-soft/70">
          태어난 시간 <span className="font-normal text-brown-soft/40">(선택)</span>
        </label>
        <input
          type="time"
          value={value.birthTime}
          onChange={(e) => onChange({ ...value, birthTime: e.target.value })}
          className="w-full rounded-xl border border-brown/10 bg-white px-4 py-2.5 text-sm text-brown focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
        />
      </div>
    </div>
  );
}

export default function FortuneForm({ category }: FortuneFormProps) {
  const isPair = category.inputKind === "twoBirthdates";
  const [personA, setPersonA] = useState<PersonInput>(EMPTY_PERSON);
  const [personB, setPersonB] = useState<PersonInput>(EMPTY_PERSON);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FortuneResult | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isPair) {
      if (!personA.birthdate || !personA.gender) {
        setError("생년월일과 성별을 입력해주세요.");
        return;
      }
      setError("");
      const seed = `${personA.birthdate}-${personA.gender}-${personA.birthTime}-${category.slug}`;
      const { dominant } = calculateElementProfile(personA.birthdate, personA.birthTime || undefined);
      const blurb = getCategoryBlurb(category.slug, dominant, seed);
      const depth = getFortuneDepth(dominant, seed);
      setResult({ kind: "single", element: dominant, blurb, ...depth });
      markSeenIfTracked(category.slug);
      return;
    }

    if (
      !personA.birthdate ||
      !personA.gender ||
      !personB.birthdate ||
      !personB.gender ||
      (category.needsMbti && (!personA.mbti || !personB.mbti))
    ) {
      setError(
        category.needsMbti
          ? "두 사람의 생년월일·성별·MBTI를 모두 입력해주세요."
          : "두 사람의 생년월일과 성별을 모두 입력해주세요."
      );
      return;
    }
    setError("");

    const elementA = calculateElementProfile(personA.birthdate, personA.birthTime || undefined).dominant;
    const elementB = calculateElementProfile(personB.birthdate, personB.birthTime || undefined).dominant;
    const affinityCategory = getAffinityCategory(elementA, elementB);
    const affinity = AFFINITY_BANK[affinityCategory];
    const seed = `${personA.birthdate}-${personB.birthdate}-${category.slug}`;
    const score = calculateAffinityScore(affinityCategory, seed);
    const depth = getFortuneDepth(elementA, seed);

    const mbtiCompat = category.needsMbti ? getMbtiCompat(personA.mbti, personB.mbti) : null;

    setResult({
      kind: "pair",
      elementA,
      elementB,
      label: affinity.label,
      emoji: affinity.emoji,
      score,
      blurb: affinity.blurb(elementA, elementB),
      mbtiLabel: mbtiCompat?.entry.label ?? "",
      mbtiEmoji: mbtiCompat?.entry.emoji ?? "",
      mbtiBlurb: mbtiCompat?.entry.blurb ?? "",
      ...depth,
    });
    markSeenIfTracked(category.slug);
  }

  function markSeenIfTracked(slug: string) {
    const trackedId: FortuneSeenId | null =
      slug === "love" ? "love" : slug === "career" ? "career" : slug === "gunghap" ? "compat" : null;
    if (trackedId) markFortuneSeen(trackedId);
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
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-brown">
                {result.emoji} {result.label}
              </span>
              <span className="inline-flex items-center rounded-full bg-coral-dark px-3 py-1 text-xs font-bold text-white">
                궁합 {result.score}
              </span>
              {result.mbtiLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-lavender/40 px-3 py-1 text-xs font-bold text-lavender-dark">
                  {result.mbtiEmoji} {result.mbtiLabel}
                </span>
              )}
            </div>
          </>
        )}

        <MockPayGate
          priceKrw={category.priceKrw}
          onUnlock={() =>
            addActivity({ category: category.nameKo, title: `${category.nameKo} 상세 풀이`, priceKrw: category.priceKrw })
          }
        >
          <div className="mt-4 space-y-3 text-left">
            <p className="text-sm leading-relaxed text-brown-soft/70">{result.blurb}</p>
            {result.kind === "pair" && result.mbtiBlurb && (
              <p className="text-sm leading-relaxed text-brown-soft/70">{result.mbtiBlurb}</p>
            )}
            <div className="rounded-lg bg-mint/15 p-3">
              <p className="text-xs font-bold text-mint-dark">💡 복실이의 조언</p>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft/70">{result.advice}</p>
            </div>
            <div className="rounded-lg bg-lavender/15 p-3">
              <p className="text-xs font-bold text-lavender-dark">⚠️ 이런 점은 조심하세요</p>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft/70">{result.caution}</p>
            </div>
            <div className="flex gap-2 text-center text-xs">
              <div className="flex-1 rounded-lg bg-cream p-2">
                <p className="font-bold text-coral-dark">행운의 색</p>
                <p className="mt-0.5 text-brown-soft/70">{result.luckyColor}</p>
              </div>
              <div className="flex-1 rounded-lg bg-cream p-2">
                <p className="font-bold text-coral-dark">행운의 아이템</p>
                <p className="mt-0.5 text-brown-soft/70">{result.luckyItem}</p>
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
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 w-full space-y-4 rounded-3xl bg-white p-6 shadow-xl shadow-brown/5 ring-1 ring-brown/5"
    >
      {isPair ? (
        <>
          <PersonFields legend="나" value={personA} onChange={setPersonA} showMbti={!!category.needsMbti} />
          <PersonFields legend="상대" value={personB} onChange={setPersonB} showMbti={!!category.needsMbti} />
        </>
      ) : (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brown">생년월일</label>
            <input
              type="date"
              value={personA.birthdate}
              onChange={(e) => setPersonA({ ...personA, birthdate: e.target.value })}
              className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brown">성별</label>
            <GenderPicker value={personA.gender} onChange={(g) => setPersonA({ ...personA, gender: g })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brown">
              태어난 시간 <span className="font-normal text-brown/40">(선택, 모르면 비워두세요)</span>
            </label>
            <input
              type="time"
              value={personA.birthTime}
              onChange={(e) => setPersonA({ ...personA, birthTime: e.target.value })}
              className="w-full rounded-xl border border-brown/10 bg-cream px-4 py-2.5 text-sm text-brown focus:border-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
          </div>
        </>
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
