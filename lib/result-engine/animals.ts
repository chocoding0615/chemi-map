export type ZodiacKey =
  | "rat"
  | "ox"
  | "tiger"
  | "rabbit"
  | "dragon"
  | "snake"
  | "horse"
  | "goat"
  | "monkey"
  | "rooster"
  | "dog"
  | "pig";

export interface AnimalEntry {
  label: string;
  emoji: string;
  blurb: string;
}

// 12-year cycle, Gregorian year only (not lunar new year accurate — intentional MVP simplification).
const ZODIAC_ORDER: ZodiacKey[] = [
  "rat",
  "ox",
  "tiger",
  "rabbit",
  "dragon",
  "snake",
  "horse",
  "goat",
  "monkey",
  "rooster",
  "dog",
  "pig",
];

export function zodiacFromYear(year: number): ZodiacKey {
  const index = ((year - 4) % 12 + 12) % 12;
  return ZODIAC_ORDER[index];
}

export const ANIMAL_BANK: Record<ZodiacKey, AnimalEntry> = {
  rat: {
    label: "쥐띠",
    emoji: "🐭",
    blurb:
      "눈치 100단, 상황 파악은 항상 제일 빠른 편이에요. 뭔가 일이 생기면 제일 먼저 해결책을 들고 나타나는 스타일!",
  },
  ox: {
    label: "소띠",
    emoji: "🐮",
    blurb: "한번 마음먹으면 끝까지 가는 우직함의 아이콘. 말보다 행동으로 믿음을 주는 타입이에요.",
  },
  tiger: {
    label: "호랑이띠",
    emoji: "🐯",
    blurb: "존재감 자체가 스포트라이트! 어디서든 중심을 잡아주는 타고난 리더 기질이 있어요.",
  },
  rabbit: {
    label: "토끼띠",
    emoji: "🐰",
    blurb: "눈치 빠르고 세심해서 옆에 있으면 편안한 사람. 분위기를 부드럽게 만드는 재주가 있어요.",
  },
  dragon: {
    label: "용띠",
    emoji: "🐲",
    blurb: '스케일이 남다른 자신감 부자! 뭘 해도 "저 사람 뭔가 있다" 소리 듣는 타입이에요.',
  },
  snake: {
    label: "뱀띠",
    emoji: "🐍",
    blurb: "겉으론 차분한데 속은 누구보다 예리한 관찰력의 소유자. 은근한 매력이 진짜 무기예요.",
  },
  horse: {
    label: "말띠",
    emoji: "🐴",
    blurb: "가만히 있질 못하는 에너지 뿜뿜형! 어디로 튈지 모르지만 그게 매력인 자유로운 영혼이에요.",
  },
  goat: {
    label: "양띠",
    emoji: "🐑",
    blurb: "다정함이 기본 장착된 힐링 요정. 옆에 있으면 마음이 몽글몽글해지는 타입이에요.",
  },
  monkey: {
    label: "원숭이띠",
    emoji: "🐵",
    blurb: "재치 만렙, 순발력 갑! 어떤 상황에서도 위트 있게 넘기는 센스쟁이예요.",
  },
  rooster: {
    label: "닭띠",
    emoji: "🐔",
    blurb: "계획 없이는 못 사는 완벽주의 야무장. 디테일 하나까지 놓치지 않는 믿음직한 스타일이에요.",
  },
  dog: {
    label: "개띠",
    emoji: "🐶",
    blurb: "의리 하나는 끝판왕! 한번 내 사람이다 싶으면 끝까지 챙기는 진국 스타일이에요.",
  },
  pig: {
    label: "돼지띠",
    emoji: "🐷",
    blurb: "존재 자체가 복덩이. 곁에 있으면 왠지 좋은 일이 생길 것 같은 든든한 사람이에요.",
  },
};
