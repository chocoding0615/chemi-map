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
    label: "귀인",
    emoji: "🌟",
    scoreBase: 84,
    blurb: (owner, visitor) => {
      const o = ELEMENT_BANK[owner];
      const v = ELEMENT_BANK[visitor];
      return `${v.label}生${o.label}(${v.hanja}生${o.hanja}) — 지칠 때 이 사람을 만나면 기운이 다시 차올라요. 나를 살리는 귀인이에요.`;
    },
  },
  danjjak: {
    label: "단짝",
    emoji: "🤎",
    scoreBase: 82,
    blurb: (owner) => {
      const o = ELEMENT_BANK[owner];
      return `같은 ${o.label}(${o.hanja}) 기운이라 성향이 비슷해서, 설명 없이도 손발이 잘 맞는 단짝이에요.`;
    },
  },
  naesaram: {
    label: "내 사람",
    emoji: "🌱",
    scoreBase: 79,
    blurb: (owner, visitor) => {
      const o = ELEMENT_BANK[owner];
      const v = ELEMENT_BANK[visitor];
      return `${o.label}生${v.label}(${o.hanja}生${v.hanja}) — 내가 시간과 마음을 써서 챙겨주게 되는, 아끼는 내 사람이에요.`;
    },
  },
  oreunpal: {
    label: "오른팔",
    emoji: "🤝",
    scoreBase: 77,
    blurb: (owner, visitor) => {
      const o = ELEMENT_BANK[owner];
      const v = ELEMENT_BANK[visitor];
      return `${o.label}剋${v.label}(${o.hanja}剋${v.hanja}) — 내가 방향을 잡으면, 이 사람은 그 방향을 든든하게 받쳐줘요.`;
    },
  },
  horangi: {
    label: "호랑이 선생",
    emoji: "🐯",
    scoreBase: 74,
    blurb: (owner, visitor) => {
      const o = ELEMENT_BANK[owner];
      const v = ELEMENT_BANK[visitor];
      return `${v.label}剋${o.label}(${v.hanja}剋${o.hanja}) — 가끔 따끔하지만, 결국 나를 성장시키는 호랑이 선생이에요.`;
    },
  },
};

// scoreBase ± 결정론적 변동폭(0~6)으로 같은 카테고리 안에서도 자연스러운 편차를 준다.
export function calculateAffinityScore(category: AffinityCategory, seed: string): number {
  const variance = pickVariant(seed, 13) - 6; // -6..+6
  return Math.min(99, Math.max(60, AFFINITY_BANK[category].scoreBase + variance));
}
