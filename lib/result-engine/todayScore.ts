import { pickVariant, ELEMENT_ORDER, type ElementKey } from "./elements";
import { getLuckyInfo } from "./sajuReading";

// TODO: 지금은 "생일(또는 손님 익명 seed) + 오늘 날짜" 기반 의사난수 점수다.
// 실제로는 오늘의 일진과 개인 사주(일주 등)의 상호작용을 반영한 산출 로직으로
// 교체될 지점 — 이 함수의 시그니처(입력: 생일·날짜, 출력: TodayScore)는 그대로
// 유지하면서 내부 계산만 바꿔 끼우면 되도록 설계했다.

export interface TodayScoreDetail {
  love: number;
  wealth: number;
  career: number;
  health: number;
}

export interface TodayScore {
  overall: number;
  detail: TodayScoreDetail;
  comment: string;
  luckyColor: string;
  luckyItem: string;
  luckyDirection: string;
}

const MIN_SCORE = 35;
const MAX_SCORE = 98;

// 극단값(0점/100점 근처)이 잘 안 나오도록 세 번 뽑아 평균 내서 중앙으로 몰리게 하고
// (동전 여러 개를 던져 합산하면 가운데로 몰리는 것과 같은 원리), 지수를 살짝 걸어
// 중상위(50~90) 쪽으로 한 번 더 밀어올린 다음 [35, 98] 구간으로 매핑한다.
function scaledScore(seed: string): number {
  const a = pickVariant(`${seed}-a`, 1000);
  const b = pickVariant(`${seed}-b`, 1000);
  const c = pickVariant(`${seed}-c`, 1000);
  const avgRaw = (a + b + c) / 3000; // 0~1, 삼각분포에 가깝게 0.5 부근에 몰림
  const biased = Math.pow(avgRaw, 0.8); // 0~1, 중상위로 살짝 밀어올림
  const score = MIN_SCORE + biased * (MAX_SCORE - MIN_SCORE);
  return Math.round(Math.min(MAX_SCORE, Math.max(MIN_SCORE, score)));
}

const COMMENT_BANK = {
  high: [
    "오늘은 뭘 해도 술술 풀리는 날이에요! 자신 있게 움직여도 좋아요.",
    "복실이가 보장해요, 오늘 운이 아주 좋아요 🍀 놓치지 말고 잘 써보세요.",
  ],
  good: [
    "전체적으로 무난하고 좋은 흐름이에요. 평소처럼만 해도 충분해요.",
    "잔잔하지만 괜찮은 하루예요. 작은 행운들이 곳곳에 숨어 있어요.",
  ],
  mid: [
    "평범한 하루예요. 무리하지 않고 내 페이스대로 가면 돼요.",
    "특별한 굴곡 없이 지나가는 날이에요. 컨디션 관리에 조금 더 신경 써보세요.",
  ],
  low: [
    "오늘은 조금 신중하게 움직이는 게 좋겠어요. 중요한 결정은 하루쯤 미뤄봐도 괜찮아요.",
    "무리하지 말고 쉬어가는 하루로 삼아보세요. 내일은 또 다른 기운이 올 거예요.",
  ],
} as const;

function commentFor(overall: number, seed: string): string {
  const tier = overall >= 80 ? "high" : overall >= 60 ? "good" : overall >= 40 ? "mid" : "low";
  const bank = COMMENT_BANK[tier];
  return bank[pickVariant(`${seed}-comment`, bank.length)];
}

// 화면(오늘의 기운/사주 결과)에 상관없이 항상 같은 값이 나오도록, 이 함수 하나만이
// 유일한 계산 지점이다 — 호출부는 "생일(있으면) + 오늘 날짜"만 넘기면 된다.
export function getTodayScore(birthdate: string | null, dateISO: string): TodayScore {
  const base = birthdate ?? "guest";
  const seed = `${base}-${dateISO}-score`;

  const detail: TodayScoreDetail = {
    love: scaledScore(`${seed}-love`),
    wealth: scaledScore(`${seed}-wealth`),
    career: scaledScore(`${seed}-career`),
    health: scaledScore(`${seed}-health`),
  };

  // 종합 점수는 세부 점수 평균에서 ±5 정도만 보정해서, "종합은 높은데 세부는
  // 다 낮다" 같은 모순이 나오지 않게 한다.
  const detailAvg = (detail.love + detail.wealth + detail.career + detail.health) / 4;
  const adjustment = pickVariant(`${seed}-adjust`, 11) - 5; // -5~+5
  const overall = Math.round(Math.min(MAX_SCORE, Math.max(MIN_SCORE, detailAvg + adjustment)));

  // 오늘의 행운 요소는 개인 사주와 무관하게 "오늘 날짜"만으로 정해져서
  // 그날 방문한 모든 사람이 같은 걸 본다(달력처럼 오늘 하루 공통 운세).
  const todayElement: ElementKey = ELEMENT_ORDER[pickVariant(dateISO, ELEMENT_ORDER.length)];
  const lucky = getLuckyInfo(todayElement);

  return {
    overall,
    detail,
    comment: commentFor(overall, seed),
    luckyColor: lucky.color,
    luckyItem: lucky.item,
    luckyDirection: lucky.direction,
  };
}
