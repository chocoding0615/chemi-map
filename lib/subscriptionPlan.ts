// 프리미엄 구독 상품 정보. 아직 실제 결제(정기결제)는 연동 전이라 이 값은
// 상세페이지 노출용 — 잔디(건별 결제)와는 별개로, 구독 여부는 boolean 플래그로
// 관리할 예정(사용자와 논의된 방향: 무제한 혜택은 잔디 소진이 아니라 구독 상태로 게이트).
export interface SubscriptionFeature {
  emoji: string;
  title: string;
  description: string;
}

export const SUBSCRIPTION_PLAN = {
  regularPriceKrw: 6900,
  priceKrw: 5900,
  billingLabel: "월",
  badge: "오픈 기념가",
};

export const SUBSCRIPTION_FEATURES: SubscriptionFeature[] = [
  {
    emoji: "🌅",
    title: "매일 아침 운세 알림",
    description: "매일 아침, 오늘의 운세를 복실이가 먼저 챙겨서 알려줘요.",
  },
  {
    emoji: "🔮",
    title: "AI 상세 사주 리포트 무제한",
    description: "십신·대운까지 담은 AI 심층 리포트를 잔디 걱정 없이 몇 번이든 만들어봐요.",
  },
];
