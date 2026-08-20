import type { ElementKey } from "@/lib/result-engine/elements";

// 마을 뷰(인연 매칭 지도)의 오행별 배경 테마. getVillageName()과 같은 ownerElement
// 값을 공유해서 "이름"과 "배경 분위기"가 항상 같은 기운을 가리키도록 맞춘다.
export interface VillageTheme {
  /** 마을 뷰 배경 그라데이션 */
  skyGradient: string;
  /** 공유 카드(OG 이미지)처럼 단색 배경만 되는 곳에 쓰는 밝은 톤 */
  bgColor: string;
  /** 하단 언덕/땅 색 */
  groundColor: string;
  /** 먼 산 실루엣 색 */
  mountainColor: string;
  /** 장식·관계선 등에 쓰는 포인트 색 */
  accentColor: string;
  /** 떠다니는 파티클 이모지 */
  particle: string;
}

export const VILLAGE_THEME: Record<ElementKey, VillageTheme> = {
  wood: {
    skyGradient: "radial-gradient(circle at 50% 30%, #f3fbe9 0%, #dcf2c2 55%, #b9e59a 100%)",
    bgColor: "#eaf7dc",
    groundColor: "#8fc46a",
    mountainColor: "#6fa851",
    accentColor: "#4d8b31",
    particle: "🌸",
  },
  fire: {
    skyGradient: "radial-gradient(circle at 50% 25%, #fff2e0 0%, #ffd7ab 55%, #ff9d6e 100%)",
    bgColor: "#ffe6cc",
    groundColor: "#e8895b",
    mountainColor: "#c25f3a",
    accentColor: "#c2410c",
    particle: "🍁",
  },
  earth: {
    skyGradient: "radial-gradient(circle at 50% 32%, #fdf4e1 0%, #f0dcab 55%, #d9b877 100%)",
    bgColor: "#f6e6c2",
    groundColor: "#c99a54",
    mountainColor: "#a97c3c",
    accentColor: "#926a1f",
    particle: "🌾",
  },
  metal: {
    skyGradient: "radial-gradient(circle at 50% 28%, #f5f8fc 0%, #e1eaf3 55%, #bfd0e2 100%)",
    bgColor: "#e6edf5",
    groundColor: "#a9bbcf",
    mountainColor: "#8296ad",
    accentColor: "#5b7391",
    particle: "❄️",
  },
  water: {
    skyGradient: "radial-gradient(circle at 50% 30%, #eaf7fb 0%, #cdecf7 55%, #9ed6ec 100%)",
    bgColor: "#d9f0f8",
    groundColor: "#6fb9d6",
    mountainColor: "#4a93b3",
    accentColor: "#0369a1",
    particle: "💧",
  },
};
