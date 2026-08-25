// 화면에 보여주는 가격과 서버에서 실제 차감하는 가격이 항상 같은 숫자를 가리키도록,
// 유료 콘텐츠 가격을 한 곳에 모은다. 클라이언트 컴포넌트(MockPayGate 등)에서도 그대로
// import하므로, firebase-admin을 쓰는 서버 전용 모듈은 여기서 절대 re-export하지 말 것
// (예: lib/sajuLlmReport.ts, lib/letters.ts — 둘 다 firebase-admin 의존이라 안 됨).
export { SAJU_LLM_REPORT_PRICE_KRW, SAJU_LLM_CHAT_FREE_QUESTIONS, SAJU_LLM_CHAT_PRICE_KRW } from "./sajuLlmPricing";
export { WALLET_TIERS, getWalletTier, type WalletTier } from "./walletTiers";

/** /saju "내 사주 풀이" 상세 잠금 가격 */
export const SAJU_SUMMARY_PRICE_KRW = 7;
