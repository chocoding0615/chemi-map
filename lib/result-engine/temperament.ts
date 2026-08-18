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

// Keirsey temperament rule: 2nd letter N/S decides the first split,
// then 3rd letter (T/F) for N-types or 4th letter (J/P) for S-types.
// Still computed and stored per entry (MBTI stays a collected field), but the
// headline relationship now comes from the 오행 상생상극 affinity system
// (see affinity.ts) rather than a temperament pairing.
export function mbtiToTemperament(mbti: string): Temperament {
  const upper = mbti.toUpperCase();
  const second = upper[1];
  const third = upper[2];
  const fourth = upper[3];
  if (second === "N") return third === "T" ? "NT" : "NF";
  return fourth === "J" ? "SJ" : "SP";
}
