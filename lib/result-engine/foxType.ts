import { pickVariant, type ElementKey } from "./elements";
import { getLuckyInfo } from "./sajuReading";
import {
  FOX_BASE,
  MODIFIERS,
  MATCH_TAGS,
  SPECIAL_COMBOS,
  FOX_TYPE_DESCRIPTIONS,
  type ModifierKey,
  type MatchTagEntry,
} from "@/lib/content/foxTypes";

export interface FoxTypeInput {
  distribution: Record<ElementKey, number>;
  /** 4글자 성격유형(예: "ENFP"). 없어도 오행 기본 5종 라벨이 그대로 나온다. */
  mbti?: string;
}

export interface FoxTypeResult {
  element: ElementKey;
  /** 수식어 없는 기본 이름(예: "새싹여우상") — MBTI 없을 때의 label과 같다. */
  baseName: string;
  /** MBTI가 있으면 수식어가 앞에 붙은 전체 라벨. */
  label: string;
  tagline: string;
  description: string;
  color: string;
  bg: string;
  prop: string;
  img: string;
  luckyColor: string;
  luckyItem: string;
  matchTag: MatchTagEntry | null;
}

// 동점이면 고정 우선순위(목>화>토>금>수)로 tie-break한다 — 결과가 매번 같아야
// 하니 랜덤은 쓰지 않는다. 사주 상세(sajuReading.ts)가 쓰는 "일간 기준" dominant와는
// 별개로, 여우상 전용으로 더 단순한 규칙을 쓴다(elements.ts 자체는 건드리지 않는다).
const PRIORITY: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];

function dominantElement(distribution: Record<ElementKey, number>): ElementKey {
  return PRIORITY.reduce((best, el) => (distribution[el] > distribution[best] ? el : best), PRIORITY[0]);
}

// J/P(리듬) × N/S(시선) 조합 하나로 수식어 키를 정한다.
function getModifierKey(mbti: string): ModifierKey | null {
  const m = mbti.trim().toUpperCase();
  if (m.length < 4) return null;
  const isJ = m[3] === "J";
  const isN = m[1] === "N";
  if (isJ && isN) return "JN";
  if (isJ && !isN) return "JS";
  if (!isJ && isN) return "PN";
  return "PS";
}

// 오행별로 "이 기질과 잘 맞는" 성격유형 힌트 글자 — 궁합 태그 판정에만 쓰인다.
const ELEMENT_MBTI_HINTS: Record<ElementKey, string[]> = {
  wood: ["N", "P"],
  fire: ["E", "F"],
  earth: ["S"],
  metal: ["T", "J"],
  water: ["I", "N"],
};

function getMatchTag(element: ElementKey, mbti: string): MatchTagEntry {
  const letters = mbti.trim().toUpperCase().split("");
  const hints = ELEMENT_MBTI_HINTS[element];
  const matchCount = hints.filter((h) => letters.includes(h)).length;
  return matchCount === hints.length ? MATCH_TAGS.aligned : MATCH_TAGS.reversed;
}

export function getFoxType(input: FoxTypeInput): FoxTypeResult {
  const element = dominantElement(input.distribution);
  const base = FOX_BASE[element];
  const mbti = input.mbti?.trim().toUpperCase();
  const modifierKey = mbti ? getModifierKey(mbti) : null;

  const label = modifierKey ? `${MODIFIERS[modifierKey]} ${base.name}` : base.name;

  const specialDescription = modifierKey ? SPECIAL_COMBOS[`${element}-${modifierKey}`] : undefined;
  const bank = FOX_TYPE_DESCRIPTIONS[element];
  const seed = `${element}-${mbti ?? "none"}`;
  const description = specialDescription ?? bank[pickVariant(seed, bank.length)];

  const lucky = getLuckyInfo(element);

  return {
    element,
    baseName: base.name,
    label,
    tagline: base.tagline,
    description,
    color: base.color,
    bg: base.bg,
    prop: base.prop,
    img: base.img,
    luckyColor: lucky.color,
    luckyItem: lucky.item,
    matchTag: modifierKey && mbti ? getMatchTag(element, mbti) : null,
  };
}
