// 이용권(잔디) 구매 티어. 실제 결제 연동 전까지는 이 값 그대로 무료 충전에 쓰이고,
// PG 붙이면 이 목록이 결제 금액의 기준이 된다. 클라이언트에서도 그대로 렌더링하므로
// firebase-admin 등 서버 전용 모듈을 여기서 절대 import하지 말 것.
export interface WalletTier {
  id: string;
  jandi: number;
  bonus: number;
  priceKrw: number;
}

export const WALLET_TIERS: WalletTier[] = [
  { id: "tier1", jandi: 3, bonus: 0, priceKrw: 990 },
  { id: "tier2", jandi: 7, bonus: 1, priceKrw: 2200 },
  { id: "tier3", jandi: 20, bonus: 3, priceKrw: 5300 },
];

export function getWalletTier(tierId: string): WalletTier | undefined {
  return WALLET_TIERS.find((t) => t.id === tierId);
}
