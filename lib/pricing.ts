// 화면에 보여주는 가격과 서버에서 실제 차감하는 가격이 항상 같은 숫자를 가리키도록,
// 유료 콘텐츠 가격을 한 곳에 모은다. 클라이언트 컴포넌트(MockPayGate 등)에서도 그대로
// import하므로, firebase-admin을 쓰는 서버 전용 모듈은 여기서 절대 re-export하지 말 것
// (예: lib/sajuLlmReport.ts, lib/letters.ts — 둘 다 firebase-admin 의존이라 안 됨).
export { SAJU_LLM_REPORT_PRICE_KRW, SAJU_LLM_CHAT_FREE_QUESTIONS, SAJU_LLM_CHAT_PRICE_KRW } from "./sajuLlmPricing";
export { WALLET_TIERS, getWalletTier, type WalletTier } from "./walletTiers";
import { FORTUNE_CATEGORIES, type CategorySlug } from "./content/fortuneCategories";

/** /saju "내 사주 풀이" 상세 잠금 가격 */
export const SAJU_SUMMARY_PRICE_KRW = 7;

// /api/wallet/purchase가 실제로 얼마를 차감할지 결정하는 유일한 기준.
// 클라이언트가 body에 얹어 보내는 priceKrw는 표시용일 뿐 절대 신뢰하지 않고,
// 서버는 이 productId → 가격 매핑만으로 다시 계산한다(devtools로 가격 조작 방지).
export type PurchaseProductId = "saju-summary" | "free" | `fortune:${CategorySlug}`;

export function getProductPriceKrw(productId: string): number | null {
  if (productId === "saju-summary") return SAJU_SUMMARY_PRICE_KRW;
  if (productId === "free") return 0;
  if (productId.startsWith("fortune:")) {
    const slug = productId.slice("fortune:".length) as CategorySlug;
    const category = FORTUNE_CATEGORIES[slug] as (typeof FORTUNE_CATEGORIES)[CategorySlug] | undefined;
    return category ? category.priceKrw : null;
  }
  return null;
}
