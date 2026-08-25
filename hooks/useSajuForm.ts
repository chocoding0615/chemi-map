"use client";

import { useEffect, useRef, useState } from "react";
import { calculateElementProfile, type ElementKey, type AdvancedBirthOptions } from "@/lib/result-engine/elements";
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
import { DEFAULT_ADVANCED_SETTINGS, type AdvancedSettingsValue } from "@/components/AdvancedSettings";
import type { ProfileDoc } from "@/lib/profileTypes";
import type { MbtiType } from "@/lib/result-engine/temperament";
import { awardForAction, markFortuneSeen } from "@/lib/foxRewards";
import { registerBackHandler } from "@/lib/backHandler";

export interface SajuResult {
  name: string;
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
  birthdate: string;
  birthTime: string;
  gender: "male" | "female";
  mbti: MbtiType | "";
  advancedOptions: AdvancedBirthOptions;
}

function toAdvancedOptions(
  isLunar: boolean,
  isLeapMonth: boolean,
  settings: AdvancedSettingsValue
): AdvancedBirthOptions {
  return {
    isLunar: isLunar || undefined,
    isLeapMonth: isLunar ? isLeapMonth : undefined,
    longitude: settings.longitudeCorrection ? (settings.longitude ? Number(settings.longitude) : 127.5) : undefined,
  };
}

// /saju 페이지의 폼 상태·제출·결과 라이프사이클을 전부 담는 훅 — 페이지는 이 훅과
// SajuForm/SajuResultView 조립만 담당하게 하려고 분리했다.
export function useSajuForm() {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [birthTime, setBirthTime] = useState("");
  const [mbti, setMbti] = useState("");
  const [isLunar, setIsLunar] = useState(false);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsValue>(DEFAULT_ADVANCED_SETTINGS);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SajuResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function applyProfile(profile: ProfileDoc) {
    setName(profile.name);
    setBirthdate(profile.birthdate);
    setGender(profile.gender);
    setBirthTime(profile.birthTime);
    setMbti(profile.mbti);
    setIsLunar(profile.isLunar ?? false);
  }

  useEffect(() => {
    if (!result) return;
    return registerBackHandler(() => setResult(null));
  }, [result]);

  useEffect(() => {
    if (!result) return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!birthdate || !gender) {
      setError("생년월일과 성별을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);

    // 계산 자체는 순간적으로 끝나지만, 로딩 상태를 한 프레임 보여줘야
    // 버튼이 바뀌는 게 사용자에게 실제로 보인다(그렇지 않으면 결과로
    // 즉시 바뀌어서 "눌렀는데 반응이 없나?" 하는 인상을 줄 수 있다).
    requestAnimationFrame(() => {
      const advancedOptions = toAdvancedOptions(isLunar, isLeapMonth, advancedSettings);
      const profile = calculateElementProfile(birthdate, birthTime || undefined, advancedOptions);
      const seed = `${birthdate}-${gender}-${birthTime}-saju`;
      const personality = getPersonalityReading(profile.dominant, seed);
      const teaser = personality.temperament.split(".")[0] + ".";

      setResult({
        name: name.trim(),
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
        birthdate,
        birthTime,
        gender,
        mbti: mbti as MbtiType | "",
        advancedOptions,
      });
      setSubmitting(false);
      awardForAction("saju");
      markFortuneSeen("saju");
    });
  }

  return {
    name,
    setName,
    birthdate,
    setBirthdate,
    gender,
    setGender,
    birthTime,
    setBirthTime,
    mbti,
    setMbti,
    isLunar,
    setIsLunar,
    isLeapMonth,
    setIsLeapMonth,
    advancedSettings,
    setAdvancedSettings,
    error,
    result,
    setResult,
    submitting,
    loadModalOpen,
    setLoadModalOpen,
    resultRef,
    applyProfile,
    handleSubmit,
  };
}

export type UseSajuFormReturn = ReturnType<typeof useSajuForm>;
