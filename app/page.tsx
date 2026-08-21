import Link from "next/link";
import FoxMascot from "@/components/FoxMascot";
import { FORTUNE_GROUPS } from "@/lib/content/fortuneGroups";
import { DIARY_ENTRIES } from "@/lib/content/diary";
import { FORTUNE_FREE_PREVIEW } from "@/lib/config";

export default function Home() {
  const diaryPreview = DIARY_ENTRIES.slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-14">
      {/* 히어로 */}
      <FoxMascot size={72} prop="star" />
      <p
        className="mt-4 text-lg text-coral-dark"
        style={{ fontFamily: "var(--font-hand)" }}
      >
        안녕, 나는 복실이야!
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-brown">여우점</h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-brown-soft">
        아기 구미호 복실이가 그려주는 나의 사주
      </p>

      {/* 대표 서비스 */}
      <div className="mt-8 grid w-full grid-cols-2 gap-3">
        <Link
          href="/saju"
          className="rounded-2xl bg-gradient-to-b from-coral to-coral-dark p-4 text-center text-white shadow-lg shadow-coral-dark/25 transition active:scale-95"
        >
          <span className="text-2xl">🔮</span>
          <p className="mt-1 text-sm font-bold">내 사주 풀이</p>
          <p className="mt-0.5 text-[11px] text-white/80">{FORTUNE_FREE_PREVIEW ? "지금은 무료" : "요약 무료"}</p>
        </Link>
        <Link
          href="/connections"
          className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-brown/10 transition active:scale-95 hover:bg-apricot/40"
        >
          <span className="text-2xl">🏘️</span>
          <p className="mt-1 text-sm font-bold text-brown">여우 마을</p>
          <p className="mt-0.5 text-[11px] text-brown-soft/50">무료 · 공유해보기</p>
        </Link>
      </div>

      {/* 무료 콘텐츠 배너 */}
      <Link
        href="/fox-type"
        className="mt-4 flex w-full items-center justify-between rounded-2xl bg-gradient-to-b from-lavender/30 to-cream p-4 shadow-sm ring-1 ring-brown/5 transition active:scale-[0.98] hover:bg-lavender/20"
      >
        <span className="flex items-center gap-3">
          <span className="text-2xl">🦊</span>
          <span>
            <span className="block text-sm font-bold text-brown">나는 무슨 여우상일까</span>
            <span className="block text-[11px] text-lavender-dark">무료 · 공유용</span>
          </span>
        </span>
        <span className="text-lg text-brown-soft/30">→</span>
      </Link>

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

      {/* 운세 더 보기 — 그룹별 섹션 */}
      <div className="mt-10 w-full space-y-8">
        {FORTUNE_GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold text-brown-soft/50">{group.title}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.items.map((item) =>
                item.disabled ? (
                  <div
                    key={item.label}
                    className="flex flex-col items-center justify-center rounded-2xl bg-brown/5 p-4 text-center opacity-60"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <p className="mt-1 text-sm font-bold text-brown-soft/50">{item.label}</p>
                    <p className="mt-0.5 text-[11px] text-brown-soft/40">{item.desc}</p>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-brown/5 transition active:scale-95 hover:bg-apricot/40"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <p className="mt-1 text-sm font-bold text-brown">{item.label}</p>
                    <p className="mt-0.5 text-[11px] text-brown-soft/40">{item.desc}</p>
                  </Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 비밀일기 프리뷰 */}
      <div className="mt-10 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-brown-soft/50">복실이의 비밀일기</h2>
          <Link href="/diary" className="text-xs font-semibold text-coral-dark underline underline-offset-2">
            더보기
          </Link>
        </div>
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
