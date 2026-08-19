// MBTI 4글자 중 몇 글자가 같은지로 정하는 궁합 티어(5단계) — 16x16=256가지 조합을
// 전부 손으로 쓰는 대신, "일치하는 글자 수"라는 하나의 규칙으로 정확히 5개 카테고리에
// 떨어뜨린다(elements.ts의 오행 상생상극과 같은 접근). AI 호출 없이도 두 사람의
// MBTI만으로 결정론적인 결과를 준다.

export type MbtiCompatTier = "twin" | "close" | "balanced" | "spark" | "opposite";

interface MbtiCompatEntry {
  label: string;
  emoji: string;
  blurb: string;
}

const MBTI_COMPAT_BANK: Record<MbtiCompatTier, MbtiCompatEntry> = {
  twin: {
    label: "쌍둥이 궁합",
    emoji: "👯",
    blurb: "MBTI 4글자가 전부 같아요. 말하지 않아도 통하는 게 많아서 편하지만, 가끔은 서로 다른 관점이 그리워질 수도 있어요.",
  },
  close: {
    label: "찰떡 궁합",
    emoji: "🍡",
    blurb: "성향이 대부분 비슷해서 손발이 잘 맞아요. 다른 한두 가지가 오히려 서로를 채워주는 포인트가 돼요.",
  },
  balanced: {
    label: "균형 궁합",
    emoji: "⚖️",
    blurb: "비슷한 점과 다른 점이 반반이라, 같이 있으면 안정감과 새로움을 동시에 느낄 수 있는 조합이에요.",
  },
  spark: {
    label: "케미 스파크 궁합",
    emoji: "✨",
    blurb: "다른 점이 꽤 많아서 처음엔 신기하게 느껴질 수 있어요. 서로에게 없는 걸 배우면서 매력을 느끼는 조합이에요.",
  },
  opposite: {
    label: "정반대 궁합",
    emoji: "🧲",
    blurb: "MBTI가 정반대예요. 부딪힐 수도 있지만, 그만큼 서로를 통해 완전히 새로운 시야를 얻을 수 있는 조합이에요.",
  },
};

function matchCount(mbtiA: string, mbtiB: string): number {
  const a = mbtiA.toUpperCase();
  const b = mbtiB.toUpperCase();
  let count = 0;
  for (let i = 0; i < 4; i++) if (a[i] === b[i]) count++;
  return count;
}

const TIER_BY_MATCH: Record<number, MbtiCompatTier> = {
  4: "twin",
  3: "close",
  2: "balanced",
  1: "spark",
  0: "opposite",
};

export function getMbtiCompat(mbtiA: string, mbtiB: string): { tier: MbtiCompatTier; entry: MbtiCompatEntry } {
  const tier = TIER_BY_MATCH[matchCount(mbtiA, mbtiB)];
  return { tier, entry: MBTI_COMPAT_BANK[tier] };
}
