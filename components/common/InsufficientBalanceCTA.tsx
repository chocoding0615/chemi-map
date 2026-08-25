import Link from "next/link";

// 예전엔 여기서 바로 무료 충전(chargeFreeWallet)을 시켜줬지만, 그 무료충전 자체를
// 없애기로 하면서 4곳(WalletPayButton/SajuLlmChat/SajuLlmReportSection/
// CategoryReadingSection)에 똑같이 있던 "충전하기" 버튼을 이걸로 통일했다.
// 지금은 광고 보고 받는 잔디(하루 3개 한도)가 유일한 무료 경로다.
export default function InsufficientBalanceCTA({ balance, required }: { balance: number; required: number }) {
  return (
    <Link
      href="/my?tab=ads"
      className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-coral bg-white/50 py-3 text-center text-sm font-bold text-coral-dark transition active:scale-95 hover:bg-white"
    >
      <span>🌱 잔디가 부족해요 · 광고 보고 받기</span>
      <span className="mt-0.5 text-[11px] font-normal text-brown-soft/90">
        보유 🌱{balance.toLocaleString()} · 필요 🌱{required.toLocaleString()}
      </span>
    </Link>
  );
}
