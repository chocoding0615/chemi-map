export type MbtiType =
  | "INTJ"
  | "INTP"
  | "ENTJ"
  | "ENTP"
  | "INFJ"
  | "INFP"
  | "ENFJ"
  | "ENFP"
  | "ISTJ"
  | "ISFJ"
  | "ESTJ"
  | "ESFJ"
  | "ISTP"
  | "ISFP"
  | "ESTP"
  | "ESFP";

export const MBTI_TYPES: MbtiType[] = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
];

export type Temperament = "NT" | "NF" | "SJ" | "SP";

export const TEMPERAMENT_LABEL: Record<Temperament, string> = {
  NT: "전략가",
  NF: "이상가",
  SJ: "수호자",
  SP: "모험가",
};

// Keirsey temperament rule: 2nd letter N/S decides the first split,
// then 3rd letter (T/F) for N-types or 4th letter (J/P) for S-types.
export function mbtiToTemperament(mbti: string): Temperament {
  const upper = mbti.toUpperCase();
  const second = upper[1];
  const third = upper[2];
  const fourth = upper[3];
  if (second === "N") return third === "T" ? "NT" : "NF";
  return fourth === "J" ? "SJ" : "SP";
}

// Outer key = A(지도 주인)의 기질, inner key = B(방문자)의 기질. "A가 보는 B" 톤.
export const RELATIONSHIP_BANK: Record<Temperament, Record<Temperament, string>> = {
  NT: {
    NT: "전략과 전략이 만났네요! 서로의 논리를 이해하는 몇 안 되는 사이라 대화가 술술 풀려요.",
    NF: "냉철한 전략가 눈에 비친 다정한 이상가라니, 은근 빠져드는 케미예요. 논리에 감성 한 스푼 더해지는 조합!",
    SJ: "체계적인 전략가와 성실한 수호자, 손발이 척척 맞는 든든한 조합이에요.",
    SP: "계획파 전략가에게 즉흥적인 모험가는 신선한 자극! 예측 불가한 매력에 자꾸 눈이 가요.",
  },
  NF: {
    NT: "따뜻한 이상가가 보기에 전략가는 살짝 어려운데 자꾸 궁금해지는 사람. 알아갈수록 매력이 깊어지는 타입이에요.",
    NF: "이상가끼리는 텔레파시가 통해요! 말 안 해도 마음이 읽히는 편안한 케미.",
    SJ: "감성 충만한 이상가에게 든든한 수호자는 안정감 그 자체. 기대고 싶어지는 존재예요.",
    SP: "자유로운 모험가는 이상가에게 늘 새로운 영감을 주는 존재. 옆에 있으면 심심할 틈이 없어요.",
  },
  SJ: {
    NT: "성실한 수호자 눈에 전략가는 똑똑하고 믿음직한 파트너로 보여요. 함께 일하면 결과가 남는 조합!",
    NF: "든든한 수호자에게 다정한 이상가는 마음을 편안하게 해주는 존재예요. 같이 있으면 저절로 힐링.",
    SJ: "수호자끼리는 신뢰가 기본! 말 안 해도 서로 챙겨주는 편안하고 안정적인 케미예요.",
    SP: "계획적인 수호자에게 자유분방한 모험가는 예상 밖의 즐거움을 주는 존재. 은근 든든하게 챙겨주고 싶어져요.",
  },
  SP: {
    NT: "즉흥적인 모험가 눈에 전략가는 멋있게 느껴지는 사람. 계획적인 모습에 묘하게 끌려요.",
    NF: "자유로운 모험가와 다정한 이상가, 함께 있으면 텐션이 확 올라가는 유쾌한 케미예요.",
    SJ: "모험가에게 수호자는 정신적 안식처 같은 존재. 든든하게 뒤를 받쳐주는 고마운 사람이에요.",
    SP: "모험가끼리 만나면 못 말리는 텐션 폭발! 같이 있으면 하루가 어떻게 가는지 모를 정도예요.",
  },
};
