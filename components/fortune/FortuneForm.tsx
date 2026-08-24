"use client";

import { useEffect, useState } from "react";
import ElementIcon from "@/components/ElementIcon";
import MbtiSelect from "@/components/MbtiSelect";
import MockPayGate from "@/components/MockPayGate";
import BirthDatePicker from "@/components/BirthDatePicker";
import BirthTimePicker from "@/components/BirthTimePicker";
import SajuDetailReport from "@/components/SajuDetailReport";
import ProfileLoadModal from "@/components/ProfileLoadModal";
import type { ProfileDoc } from "@/lib/profileTypes";
import { getCategoryBlurb, type FortuneCategory } from "@/lib/content/fortuneCategories";
import { calculateElementProfile, ELEMENT_BANK, type ElementKey } from "@/lib/result-engine/elements";
import { getAffinityCategory, AFFINITY_BANK, calculateAffinityScore } from "@/lib/result-engine/affinity";
import { getFortuneDepth } from "@/lib/result-engine/depth";
import { getMbtiCompat } from "@/lib/result-engine/mbtiCompat";
import { markFortuneSeen } from "@/lib/foxRewards";
import type { FortuneSeenId } from "@/lib/progress";
import { registerBackHandler } from "@/lib/backHandler";
import { withJosa } from "@/lib/josa";

interface FortuneFormProps {
  category: FortuneCategory;
}

type Gender = "male" | "female";

interface PersonInput {
  name: string;
  birthdate: string;
  gender: Gender | "";
  birthTime: string;
  mbti: string;
}

const EMPTY_PERSON: PersonInput = { name: "", birthdate: "", gender: "", birthTime: "", mbti: "" };

type FortuneResult =
  | {
      kind: "single";
      element: ElementKey;
      blurb: string;
      advice: string;
      caution: string;
      luckyColor: string;
      luckyItem: string;
      name: string;
      birthdate: string;
      birthTime: string;
      gender: Gender;
    }
  | {
      kind: "pair";
      nameA: string;
      nameB: string;
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
      birthdateA: string;
      birthTimeA: string;
      genderA: Gender;
      birthdateB: string;
      birthTimeB: string;
      genderB: Gender;
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
              : "bg-cream text-brown-soft ring-1 ring-brown/10 hover:bg-apricot"
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
  onLoadClick,
}: {
  legend: string;
  value: PersonInput;
  onChange: (next: PersonInput) => void;
  showMbti: boolean;
  onLoadClick: () => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl bg-cream/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-brown">{legend}</p>
        <button type="button" onClick={onLoadClick} className="text-xs font-bold text-coral-dark underline underline-offset-2">
          📋 불러오기
        </button>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brown-soft">
          이름 <span className="font-normal text-brown-soft/40">(선택)</span>
        </label>
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          maxLength={20}
          placeholder="홍길동"
          className="w-full rounded-xl border border-brown/10 bg-white px-4 py-2.5 text-sm text-brown placeholder:text-brown/30 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brown-soft">생년월일</label>
        <BirthDatePicker value={value.birthdate} onChange={(birthdate) => onChange({ ...value, birthdate })} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brown-soft">성별</label>
        <GenderPicker value={value.gender} onChange={(g) => onChange({ ...value, gender: g })} />
      </div>
      {showMbti && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brown-soft">MBTI</label>
          <MbtiSelect value={value.mbti} onChange={(mbti) => onChange({ ...value, mbti })} />
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brown-soft">
          태어난 시간 <span className="font-normal text-brown-soft/40">(선택)</span>
        </label>
        <BirthTimePicker value={value.birthTime} onChange={(birthTime) => onChange({ ...value, birthTime })} />
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
  const [loadTarget, setLoadTarget] = useState<"A" | "B" | null>(null);

  function applyProfile(profile: ProfileDoc) {
    const next: PersonInput = {
      name: profile.label,
      birthdate: profile.birthdate,
      gender: profile.gender,
      birthTime: profile.birthTime,
      mbti: profile.mbti,
    };
    if (loadTarget === "B") setPersonB(next);
    else setPersonA(next);
  }

  useEffect(() => {
    if (!result) return;
    return registerBackHandler(() => setResult(null));
  }, [result]);

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
      setResult({
        kind: "single",
        element: dominant,
        blurb,
        ...depth,
        name: personA.name.trim(),
        birthdate: personA.birthdate,
        birthTime: personA.birthTime,
        gender: personA.gender as Gender,
      });
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
      nameA: personA.name.trim(),
      nameB: personB.name.trim(),
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
      birthdateA: personA.birthdate,
      birthTimeA: personA.birthTime,
      genderA: personA.gender as Gender,
      birthdateB: personB.birthdate,
      birthTimeB: personB.birthTime,
      genderB: personB.gender as Gender,
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
            {result.name && <p className="mt-2 text-sm font-bold text-coral-dark">{result.name}님의 결과예요</p>}
            <p className="mt-1 text-sm font-semibold text-brown-soft/90">
              {ELEMENT_BANK[result.element].label}({ELEMENT_BANK[result.element].hanja}) 기운
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center gap-2">
              <ElementIcon element={result.elementA} size={48} />
              <ElementIcon element={result.elementB} size={48} />
            </div>
            <p className="mt-2 text-sm font-bold text-coral-dark">
              {result.nameA || "나"} ♥ {result.nameB || "상대"} 궁합
            </p>
            <p className="mt-1 text-xs text-brown-soft/90">
              {withJosa(result.nameA || "나", "와/과")} {result.nameB || "상대"}의 케미 {result.score}점
            </p>
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
          category={category.nameKo}
          title={`${category.nameKo} 상세 풀이`}
        >
          <div className="mt-4 space-y-3 text-left">
            <p className="text-sm leading-relaxed text-brown-soft">{result.blurb}</p>
            {result.kind === "pair" && result.mbtiBlurb && (
              <p className="text-sm leading-relaxed text-brown-soft">{result.mbtiBlurb}</p>
            )}
            <div className="rounded-lg bg-mint/15 p-3">
              <p className="text-xs font-bold text-mint-dark">💡 복실이의 조언</p>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft">{result.advice}</p>
            </div>
            <div className="rounded-lg bg-lavender/15 p-3">
              <p className="text-xs font-bold text-lavender-dark">⚠️ 이런 점은 조심하세요</p>
              <p className="mt-1 text-sm leading-relaxed text-brown-soft">{result.caution}</p>
            </div>
            <div className="flex gap-2 text-center text-xs">
              <div className="flex-1 rounded-lg bg-cream p-2">
                <p className="font-bold text-coral-dark">행운의 색</p>
                <p className="mt-0.5 text-brown-soft">{result.luckyColor}</p>
              </div>
              <div className="flex-1 rounded-lg bg-cream p-2">
                <p className="font-bold text-coral-dark">행운의 아이템</p>
                <p className="mt-0.5 text-brown-soft">{result.luckyItem}</p>
              </div>
            </div>
          </div>

          {result.kind === "single" ? (
            <SajuDetailReport
              label={result.name || "나"}
              birthdate={result.birthdate}
              birthTime={result.birthTime || undefined}
              gender={result.gender}
            />
          ) : (
            <>
              <SajuDetailReport
                label={result.nameA || "나"}
                birthdate={result.birthdateA}
                birthTime={result.birthTimeA || undefined}
                gender={result.genderA}
              />
              <SajuDetailReport
                label={result.nameB || "상대"}
                birthdate={result.birthdateB}
                birthTime={result.birthTimeB || undefined}
                gender={result.genderB}
              />
            </>
          )}
        </MockPayGate>

        <button
          type="button"
          onClick={() => setResult(null)}
          className="mt-4 text-xs font-semibold text-brown-soft/90 underline underline-offset-2"
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
          <PersonFields
            legend="나"
            value={personA}
            onChange={setPersonA}
            showMbti={!!category.needsMbti}
            onLoadClick={() => setLoadTarget("A")}
          />
          <PersonFields
            legend="상대"
            value={personB}
            onChange={setPersonB}
            showMbti={!!category.needsMbti}
            onLoadClick={() => setLoadTarget("B")}
          />
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setLoadTarget("A")}
            className="w-full rounded-xl bg-cream py-2 text-xs font-bold text-brown-soft transition active:scale-95 hover:bg-apricot"
          >
            📋 저장해둔 기본정보 불러오기
          </button>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brown">
              이름 <span className="font-normal text-brown/40">(선택)</span>
            </label>
            <input
              value={personA.name}
              onChange={(e) => setPersonA({ ...personA, name: e.target.value })}
              maxLength={20}
              placeholder="홍길동"
              className="w-full rounded-xl border border-brown/10 bg-white px-4 py-2.5 text-sm text-brown placeholder:text-brown/30 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brown">생년월일</label>
            <BirthDatePicker
              value={personA.birthdate}
              onChange={(birthdate) => setPersonA({ ...personA, birthdate })}
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
            <BirthTimePicker
              value={personA.birthTime}
              onChange={(birthTime) => setPersonA({ ...personA, birthTime })}
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

      {loadTarget && (
        <ProfileLoadModal
          onSelect={applyProfile}
          onClose={() => setLoadTarget(null)}
        />
      )}
    </form>
  );
}
