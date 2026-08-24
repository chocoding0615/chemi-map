import Link from "next/link";
import FoxMascot from "@/components/FoxMascot";
import SubscribeCta from "@/components/SubscribeCta";
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_FEATURES } from "@/lib/subscriptionPlan";

export const metadata = { title: "여우점 프리미엄 · 여우점" };

export default function SubscribePage() {
  const discountPercent = Math.round(
    (1 - SUBSCRIPTION_PLAN.priceKrw / SUBSCRIPTION_PLAN.regularPriceKrw) * 100
  );

  return (
    <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="star" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">여우점 프리미엄</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft">
        복실이가 매일 아침 챙겨주는 운세 알림과, 잔디 걱정 없는 AI 리포트를 한 번에
      </p>

      <div className="mt-8 w-full rounded-3xl bg-gradient-to-b from-lavender/25 to-cream p-6 text-center shadow-xl shadow-brown/5 ring-1 ring-brown/5">
        <span className="inline-block rounded-full bg-coral px-3 py-1 text-[11px] font-bold text-white">
          {SUBSCRIPTION_PLAN.badge}
        </span>
        <div className="mt-3 flex items-end justify-center gap-2">
          <span className="text-sm text-brown-soft/40 line-through">
            {SUBSCRIPTION_PLAN.regularPriceKrw.toLocaleString()}원
          </span>
          <span className="text-3xl font-extrabold text-brown">
            {SUBSCRIPTION_PLAN.priceKrw.toLocaleString()}원
          </span>
          <span className="pb-1 text-sm font-semibold text-brown-soft/60">
            /{SUBSCRIPTION_PLAN.billingLabel}
          </span>
        </div>
        <p className="mt-1 text-xs font-semibold text-mint-dark">{discountPercent}% 할인된 오픈 기념가예요</p>
      </div>

      <div className="mt-6 w-full space-y-3">
        {SUBSCRIPTION_FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brown/5"
          >
            <span className="text-2xl">{feature.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-brown">{feature.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-brown-soft/90">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 w-full">
        <SubscribeCta />
        <p className="mt-3 text-center text-[11px] leading-relaxed text-brown-soft/40">
          구독은 잔디 잔액과는 별개로 관리돼요 · 언제든 해지할 수 있어요
        </p>
      </div>

      <Link href="/my" className="mt-6 text-xs font-semibold text-brown-soft/40 underline underline-offset-2">
        마이페이지로 돌아가기
      </Link>
    </div>
  );
}
