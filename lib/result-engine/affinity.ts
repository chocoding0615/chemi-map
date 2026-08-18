import { ELEMENT_BANK, pickVariant, type ElementKey } from "./elements";

export type AffinityCategory = "guin" | "danjjak" | "naesaram" | "oreunpal" | "horangi";

export const AFFINITY_ORDER: AffinityCategory[] = ["guin", "danjjak", "naesaram", "oreunpal", "horangi"];

// 오행 상생(相生) 순환: 목생화 -> 화생토 -> 토생금 -> 금생수 -> 수생목 -> (목)
const GENERATES: Record<ElementKey, ElementKey> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

// 오행 상극(相剋) 순환: 목극토 -> 토극수 -> 수극화 -> 화극금 -> 금극목 -> (목)
const OVERCOMES: Record<ElementKey, ElementKey> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

// owner(나) 기준으로 visitor(상대)가 어떤 관계인지 판정. 5개 오행 조합(5x5=25가지)이
// 예외 없이 이 5개 카테고리 중 하나로 정확히 떨어진다 — 손으로 쓸 문구는 카테고리당 1개뿐.
export function getAffinityCategory(ownerElement: ElementKey, visitorElement: ElementKey): AffinityCategory {
  if (ownerElement === visitorElement) return "danjjak";
  if (GENERATES[visitorElement] === ownerElement) return "guin"; // 상대가 나를 생(生)함
  if (GENERATES[ownerElement] === visitorElement) return "naesaram"; // 내가 상대를 생(生)함
  if (OVERCOMES[visitorElement] === ownerElement) return "horangi"; // 상대가 나를 극(剋)함
  return "oreunpal"; // 내가 상대를 극(剋)함
}

interface AffinityEntry {
  label: string;
  emoji: string;
  scoreBase: number;
  blurb: (owner: ElementKey, visitor: ElementKey) => string;
}

export const AFFINITY_BANK: Record<AffinityCategory, AffinityEntry> = {
  guin: {
    label: "나침반",
    emoji: "🧭",
    scoreBase: 84,
    blurb: (owner, visitor) => {
      const o = ELEMENT_BANK[owner];
      const v = ELEMENT_BANK[visitor];
      return `${v.label}生${o.label}(${v.hanja}生${o.hanja}) — 길을 잃은 것 같을 때 이 사람을 만나면 방향이 다시 보여요. 나를 이끌어주는 나침반이에요.`;
    },
  },
  danjjak: {
    label: "짝꿍",
    emoji: "🫶",
    scoreBase: 82,
    blurb: (owner) => {
      const o = ELEMENT_BANK[owner];
      return `같은 ${o.label}(${o.hanja}) 기운이라 성향이 비슷해서, 설명 없이도 손발이 잘 맞는 짝꿍이에요.`;
    },
  },
  naesaram: {
    label: "새싹",
    emoji: "🌱",
    scoreBase: 79,
    blurb: (owner, visitor) => {
      const o = ELEMENT_BANK[owner];
      const v = ELEMENT_BANK[visitor];
      return `${o.label}生${v.label}(${o.hanja}生${v.hanja}) — 내가 시간과 마음을 써서 물을 주게 되는, 아끼는 새싹이에요.`;
    },
  },
  oreunpal: {
    label: "지원군",
    emoji: "🤝",
    scoreBase: 77,
    blurb: (owner, visitor) => {
      const o = ELEMENT_BANK[owner];
      const v = ELEMENT_BANK[visitor];
      return `${o.label}剋${v.label}(${o.hanja}剋${v.hanja}) — 내가 방향을 잡고 나아가면, 이 사람은 뒤에서 든든하게 받쳐주는 지원군이에요.`;
    },
  },
  horangi: {
    label: "오르막",
    emoji: "⛰️",
    scoreBase: 74,
    blurb: (owner, visitor) => {
      const o = ELEMENT_BANK[owner];
      const v = ELEMENT_BANK[visitor];
      return `${v.label}剋${o.label}(${v.hanja}剋${o.hanja}) — 가끔 숨차고 힘들지만, 오르고 나면 결국 나를 한 뼘 키워주는 오르막이에요.`;
    },
  },
};

// scoreBase ± 결정론적 변동폭(0~6)으로 같은 카테고리 안에서도 자연스러운 편차를 준다.
export function calculateAffinityScore(category: AffinityCategory, seed: string): number {
  const variance = pickVariant(seed, 13) - 6; // -6..+6
  return Math.min(99, Math.max(60, AFFINITY_BANK[category].scoreBase + variance));
}

// 마을에 등록된 사람들 중 가장 많은 카테고리를 보고 마을 분위기를 한 줄로 설명한다.
const VILLAGE_VIBE: Record<AffinityCategory, string> = {
  guin: "나침반처럼 방향을 알려주는 사람들이 유독 많은 마을이에요.",
  danjjak: "죽이 잘 맞는 짝꿍들이 모인, 인복 넘치는 마을이에요.",
  naesaram: "정 많고 챙겨주는 걸 좋아하는 사람들이 자라나는 마을이에요.",
  oreunpal: "묵묵히 뒤를 받쳐주는 든든한 사람들이 모인 마을이에요.",
  horangi: "만날 때마다 한 뼘씩 성장하게 되는, 단단한 마을이에요.",
};

export function describeVillageVibe(entries: { affinityCategory: AffinityCategory }[]): string {
  if (entries.length === 0) return "아직 아무도 살지 않는 마을이에요. 첫 번째 이웃을 초대해보세요!";

  const counts: Record<AffinityCategory, number> = { guin: 0, danjjak: 0, naesaram: 0, oreunpal: 0, horangi: 0 };
  for (const entry of entries) counts[entry.affinityCategory]++;

  const top = AFFINITY_ORDER.reduce((best, key) => (counts[key] > counts[best] ? key : best));
  return VILLAGE_VIBE[top];
}
