import { calculateFourPillars, getHeavenlyStemElement, type TenGod } from "manseryeok";
import type { ElementKey } from "./elements";

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

export interface LuckPillarView {
  age: number;
  korean: string;
  element: ElementKey;
}

export interface SajuDetailFacts {
  tenGodCounts: Record<TenGod, number>;
  topTenGods: TenGod[];
  luckPillars: LuckPillarView[] | null;
  currentLuckPillar: LuckPillarView | null;
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

export function calculateSajuDetail(birthdate: string, birthTime: string | undefined, gender: Gender): SajuDetailFacts {
  const [year, month, day] = birthdate.split("-").map(Number);
  const hasTimeInput = Boolean(birthTime);
  const [hour, minute] = hasTimeInput ? birthTime!.split(":").map(Number) : [12, 0];

  const pillars = calculateFourPillars({ year, month, day, hour, minute, gender });

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

  return { tenGodCounts: counts, topTenGods, luckPillars, currentLuckPillar };
}
