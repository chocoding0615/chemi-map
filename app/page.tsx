import Link from "next/link";
import FoxMascot from "@/components/FoxMascot";
import AccessBadge from "@/components/common/AccessBadge";
import SectionHeader from "@/components/common/SectionHeader";
import DisabledFortuneCard from "@/components/DisabledFortuneCard";
import { FORTUNE_GROUPS } from "@/lib/content/fortuneGroups";
import { DIARY_ENTRIES } from "@/lib/content/diary";
import { FORTUNE_FREE_PREVIEW } from "@/lib/config";
import { SAJU_SUMMARY_PRICE_KRW } from "@/lib/pricing";

export default function Home() {
  const diaryPreview = DIARY_ENTRIES.slice(0, 3);
  const sajuAccess = FORTUNE_FREE_PREVIEW ? ({ kind: "free" } as const) : ({ kind: "price", priceKrw: SAJU_SUMMARY_PRICE_KRW } as const);

  return (
    <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-14">
      {/* 히어로 */}
      <FoxMascot size={72} prop="star" />
      <p
        className="mt-4 text-xl font-bold text-coral-dark"
        style={{ fontFamily: "var(--font-hand)" }}
      >
        안녕, 나는 복실이야!
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-brown">여우점</h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-brown-soft">
        아기 구미호 복실이가 그려주는 나의 사주
      </p>

      {/* L1: 대표 액션 — 화면에서 가장 크고 진한 카드 */}
      <Link
        href="/saju"
        className="mt-10 flex w-full flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-coral to-coral-dark py-8 text-center text-white shadow-xl shadow-coral-dark/25 transition active:scale-95"
      >
        <span className="text-4xl">🔮</span>
        <p className="mt-2 text-lg font-extrabold">내 사주 풀이</p>
        <span className="mt-2 inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">
          {sajuAccess.kind === "free" ? "무료" : `잔디 ${sajuAccess.priceKrw.toLocaleString()}개`}
        </span>
      </Link>

      {/* L2: 핵심 보조 — L1보다 작게, 외곽선형 2열 */}
      <div className="mt-3 grid w-full grid-cols-2 gap-3">
        <Link
          href="/connections"
          className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-brown/10 transition active:scale-95 hover:bg-apricot/40"
        >
          <span className="text-2xl">🏘️</span>
          <p className="mt-2 text-sm font-bold text-brown">여우 마을</p>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <AccessBadge state={{ kind: "free" }} />
            <span className="text-[11px] text-brown-soft/60">공유해보기</span>
          </div>
        </Link>
        <Link
          href="/fox-type"
          className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-brown/10 transition active:scale-95 hover:bg-apricot/40"
        >
          <span className="text-2xl">🦊</span>
          <p className="mt-2 text-sm font-bold text-brown">여우상 보기</p>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <AccessBadge state={{ kind: "free" }} />
            <span className="text-[11px] text-brown-soft/60">공유용</span>
          </div>
        </Link>
      </div>

      <Link
        href="/letter/inbox"
        className="mt-3 flex w-full items-center justify-between rounded-2xl bg-gradient-to-b from-mint/30 to-cream p-4 shadow-sm ring-1 ring-brown/5 transition active:scale-[0.98] hover:bg-mint/20"
      >
        <span className="flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <span>
            <span className="block text-sm font-bold text-brown">비밀 편지함</span>
            <span className="block text-[11px] text-mint-dark">나한테 온 편지가 있을지도?</span>
          </span>
        </span>
        <span className="text-lg text-brown-soft/30">→</span>
      </Link>

      {/* 바이럴 심테 놀이터 — 유입 깔때기 */}
      <Link
        href="/test"
        className="mt-3 flex w-full items-center justify-between rounded-2xl bg-gradient-to-b from-violet-100 to-purple-100 p-4 shadow-sm ring-1 ring-brown/5 transition active:scale-[0.98] hover:from-violet-200 hover:to-purple-200"
      >
        <span className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <span>
            <span className="block text-sm font-bold text-brown">심테 놀이터</span>
            <span className="block text-[11px] text-purple-400">과몰입 테스트 하고 결과 카드 저장!</span>
          </span>
        </span>
        <span className="text-lg text-brown-soft/30">→</span>
      </Link>

      {/* 운세 더 보기 — 그룹별 섹션 */}
      <div className="mt-10 w-full space-y-10">
        {FORTUNE_GROUPS.map((group) => (
          <div key={group.title}>
            <SectionHeader title={group.title} />
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.items.map((item) =>
                item.access.kind === "soon" ? (
                  <DisabledFortuneCard key={item.label} icon={item.icon} label={item.label} />
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex flex-col items-center justify-center rounded-2xl p-4 text-center shadow-sm transition active:scale-95 ${
                      item.emphasize
                        ? "bg-apricot/40 ring-2 ring-coral/30 hover:bg-apricot/60"
                        : "bg-white ring-1 ring-brown/5 hover:bg-apricot/40"
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <p className="mt-2 text-sm font-bold text-brown">{item.label}</p>
                    <div className="mt-2 flex items-center justify-center gap-1.5">
                      <AccessBadge state={item.access} />
                      {item.caption && <span className="text-[11px] text-brown-soft/60">{item.caption}</span>}
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 비밀일기 프리뷰 */}
      <div className="mt-10 w-full">
        <SectionHeader title="복실이의 비밀일기" moreHref="/diary" />
        <div className="mt-3 space-y-2">
          {diaryPreview.map((entry) => (
            <Link
              key={entry.id}
              href={`/diary/${entry.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-brown/5 transition active:scale-[0.98] hover:bg-apricot/40"
            >
              <span className="text-xl">{entry.emoji}</span>
              <p className="min-w-0 truncate text-sm font-semibold text-brown">{entry.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
