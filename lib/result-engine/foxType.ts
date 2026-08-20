import { pickVariant, type ElementKey } from "./elements";
import { getLuckyInfo } from "./sajuReading";
import { FOX_TYPE_DESCRIPTIONS } from "@/lib/content/foxTypes";

export interface FoxTypeInput {
  distribution: Record<ElementKey, number>;
  /** 4글자 성격유형(예: "ENFP"). 없어도 오행만으로 5종 라벨이 나온다. */
  mbti?: string;
}

export type MatchTag = "타고난 결" | "은은한 조화" | "반전 매력";

export interface FoxTypeResult {
  element: ElementKey;
  foxType: string;
  label: string;
  description: string;
  luckyColor: string;
  luckyItem: string;
  matchTag: MatchTag | null;
}

// 동점이면 고정 우선순위(목>화>토>금>수)로 tie-break한다 — 결과가 매번 같아야
// 하니 랜덤은 쓰지 않는다. 사주 상세(sajuReading.ts)가 쓰는 "일간 기준" dominant와는
// 별개로, 여우상 전용으로 더 단순한 규칙을 쓴다(elements.ts 자체는 건드리지 않는다).
const PRIORITY: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];

function dominantElement(distribution: Record<ElementKey, number>): ElementKey {
  return PRIORITY.reduce((best, el) => (distribution[el] > distribution[best] ? el : best), PRIORITY[0]);
}

const FOX_BY_ELEMENT: Record<ElementKey, string> = {
  wood: "새싹여우",
  fire: "불꽃여우",
  earth: "달빛여우",
  metal: "서리여우",
  water: "물안개여우",
};

interface MbtiModifiers {
  activity: string; // E/I — 지금은 라벨에 안 쓰지만 나중 확장 대비로 계산해둔다
  outlook: string; // N/S
  logic: string; // T/F
  pace: string; // J/P
}

function parseMbtiModifiers(mbti: string): MbtiModifiers | null {
  const m = mbti.trim().toUpperCase();
  if (m.length < 4) return null;
  return {
    activity: m[0] === "E" ? "활발한" : "조용한",
    outlook: m[1] === "N" ? "꿈꾸는" : "현실적인",
    logic: m[2] === "T" ? "냉철한" : "다정한",
    pace: m[3] === "J" ? "계획적인" : "자유로운",
  };
}

// 라벨이 너무 길어지지 않게 두 축(계획성·시선)만 골라 조합한다 — 예: "자유로운 꿈꾸는 새싹여우".
function buildLabel(fox: string, modifiers: MbtiModifiers | null): string {
  if (!modifiers) return fox;
  return `${modifiers.pace} ${modifiers.outlook} ${fox}`;
}

// 오행별로 "이 기질과 잘 맞는" 성격유형 힌트 글자 — 궁합 태그 판정에만 쓰인다.
const ELEMENT_MBTI_HINTS: Record<ElementKey, string[]> = {
  wood: ["N", "P"],
  fire: ["E", "F"],
  earth: ["S"],
  metal: ["T", "J"],
  water: ["I", "N"],
};

function getMatchTag(element: ElementKey, mbti: string): MatchTag {
  const letters = mbti.trim().toUpperCase().split("");
  const hints = ELEMENT_MBTI_HINTS[element];
  const matchCount = hints.filter((h) => letters.includes(h)).length;
  if (matchCount === hints.length) return "타고난 결";
  if (matchCount === 0) return "반전 매력";
  return "은은한 조화";
}

export function getFoxType(input: FoxTypeInput): FoxTypeResult {
  const element = dominantElement(input.distribution);
  const fox = FOX_BY_ELEMENT[element];
  const mbti = input.mbti?.trim().toUpperCase();
  const modifiers = mbti ? parseMbtiModifiers(mbti) : null;

  const descriptions = FOX_TYPE_DESCRIPTIONS[element];
  const seed = `${element}-${mbti ?? "none"}`;
  const description = descriptions[pickVariant(seed, descriptions.length)];
  const lucky = getLuckyInfo(element);

  return {
    element,
    foxType: fox,
    label: buildLabel(fox, modifiers),
    description,
    luckyColor: lucky.color,
    luckyItem: lucky.item,
    matchTag: modifiers && mbti ? getMatchTag(element, mbti) : null,
  };
}
