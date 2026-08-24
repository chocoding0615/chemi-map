import { calculateFourPillars, getHeavenlyStemElement, type TenGod } from "manseryeok";
import { calculateElementProfile, type AdvancedBirthOptions, type ElementKey } from "./elements";

// /saju + 9개 운세 카테고리의 "상세(유료)" 섹션 전용 — manseryeok이 calculateFourPillars()
// 안에서 이미 계산해서 반환하는 십신(tenGods)·대운(luckPillars)을 새로 뽑아 쓴다.
// elements.ts의 calculateElementProfile()은 오행 카운트만 쓰고 이 필드들을 버리므로,
// 그 함수를 건드리지 않고 여기서 manseryeok을 한 번 더(동일 패턴으로) 호출한다.

const ELEMENT_LABEL_TO_KEY: Record<string, ElementKey> = {
  목: "wood",
  화: "fire",
  토: "earth",
  금: "metal",
  수: "water",
};

export type Gender = "male" | "female";

export type TenGodGroup = "비겁" | "식상" | "재성" | "관성" | "인성";

const TEN_GOD_GROUP: Record<TenGod, TenGodGroup> = {
  비견: "비겁",
  겁재: "비겁",
  식신: "식상",
  상관: "식상",
  편재: "재성",
  정재: "재성",
  편관: "관성",
  정관: "관성",
  편인: "인성",
  정인: "인성",
};

export interface LuckPillarView {
  age: number;
  korean: string;
  element: ElementKey;
}

export interface SajuDetailFacts {
  tenGodCounts: Record<TenGod, number>;
  topTenGods: TenGod[];
  dominantGroup: TenGodGroup;
  dayMaster: string;
  strength: "신강" | "신약";
  luckPillars: LuckPillarView[] | null;
  currentLuckPillar: LuckPillarView | null;
  currentYearGapja: string;
  yongsinElement: ElementKey;
}

const EMPTY_TEN_GOD_COUNTS = (): Record<TenGod, number> => ({
  비견: 0,
  겁재: 0,
  식신: 0,
  상관: 0,
  편재: 0,
  정재: 0,
  편관: 0,
  정관: 0,
  편인: 0,
  정인: 0,
});

export function calculateSajuDetail(
  birthdate: string,
  birthTime: string | undefined,
  gender: Gender,
  advanced?: AdvancedBirthOptions
): SajuDetailFacts {
  const [year, month, day] = birthdate.split("-").map(Number);
  const hasTimeInput = Boolean(birthTime);
  const [hour, minute] = hasTimeInput ? birthTime!.split(":").map(Number) : [12, 0];

  const pillars = calculateFourPillars({
    year,
    month,
    day,
    hour,
    minute,
    gender,
    ...(advanced?.isLunar ? { isLunar: true, isLeapMonth: advanced.isLeapMonth } : {}),
    ...(advanced?.longitude !== undefined ? { trueSolarTime: { longitude: advanced.longitude } } : {}),
  });

  const counts = EMPTY_TEN_GOD_COUNTS();
  counts[pillars.tenGods.year.stem]++;
  counts[pillars.tenGods.year.branch]++;
  counts[pillars.tenGods.month.stem]++;
  counts[pillars.tenGods.month.branch]++;
  counts[pillars.tenGods.day.branch]++;
  if (hasTimeInput) {
    counts[pillars.tenGods.hour.stem]++;
    counts[pillars.tenGods.hour.branch]++;
  }

  const topTenGods = (Object.entries(counts) as [TenGod, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([tenGod]) => tenGod);

  let luckPillars: LuckPillarView[] | null = null;
  let currentLuckPillar: LuckPillarView | null = null;

  if (pillars.luckPillars) {
    luckPillars = pillars.luckPillars.pillars.map((p) => ({
      age: p.age,
      korean: p.korean,
      element: ELEMENT_LABEL_TO_KEY[getHeavenlyStemElement(p.pillar.heavenlyStem)],
    }));

    const currentAge = new Date().getFullYear() - year;
    currentLuckPillar =
      [...luckPillars].reverse().find((p) => currentAge >= p.age) ?? null;
  }

  const dayMaster = pillars.day.heavenlyStem;

  // 신강/신약: 일간을 돕는 비겁(같은 편)+인성(나를 채워주는 기운) 합이
  // 나를 쓰게 만드는 식상+재성+관성 합보다 크거나 같으면 신강으로 본다(단순화된 통용 기준).
  const supportCount = counts.비견 + counts.겁재 + counts.편인 + counts.정인;
  const drainCount = counts.식신 + counts.상관 + counts.편재 + counts.정재 + counts.편관 + counts.정관;
  const strength: "신강" | "신약" = supportCount >= drainCount ? "신강" : "신약";

  const groupTotals: Record<TenGodGroup, number> = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
  for (const [tenGod, count] of Object.entries(counts) as [TenGod, number][]) {
    groupTotals[TEN_GOD_GROUP[tenGod]] += count;
  }
  const dominantGroup = (Object.entries(groupTotals) as [TenGodGroup, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  // 세운(올해 흐름)은 입춘 경계에서 먼 6월 중순 기준으로 올해 연주만 뽑아 쓴다.
  const now = new Date();
  const thisYearPillars = calculateFourPillars({ year: now.getFullYear(), month: 6, day: 15, hour: 12, minute: 0 });
  const currentYearGapja = `${thisYearPillars.year.heavenlyStem}${thisYearPillars.year.earthlyBranch}`;

  // 용신: 사주 오행 분포에서 가장 부족한 기운을 보태 균형을 맞춰주는 오행으로 본다(단순화된 통용 기준).
  const { distribution } = calculateElementProfile(birthdate, birthTime, advanced);
  const yongsinElement = (Object.entries(distribution) as [ElementKey, number][]).sort(
    (a, b) => a[1] - b[1]
  )[0][0];

  return {
    tenGodCounts: counts,
    topTenGods,
    dominantGroup,
    dayMaster,
    strength,
    luckPillars,
    currentLuckPillar,
    currentYearGapja,
    yongsinElement,
  };
}
