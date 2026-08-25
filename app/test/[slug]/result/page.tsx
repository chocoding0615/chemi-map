import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import TestResultShare from "@/components/test/TestResultShare";
import { getTestDef, resolveTestResult } from "@/lib/content/tests";
import { getDb } from "@/lib/firebaseAdmin";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string; s?: string; n?: string }>;
}

function clampScore(def: NonNullable<ReturnType<typeof getTestDef>>, s: number): number {
  const first = def.results[0];
  const last = def.results[def.results.length - 1];
  return Math.min(Math.max(s, first.minScore), last.maxScore);
}

function decodeNickname(n?: string): string {
  if (!n) return "";
  try {
    return decodeURIComponent(n).trim().slice(0, 12);
  } catch {
    return "";
  }
}

// 링크가 카톡/디스코드로 공유될 때 결과 유형이 미리보기로 뜨도록 동적 메타데이터를 만든다.
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const def = getTestDef(slug);
  if (!def) return { title: "테스트 결과 | 여우점" };

  const score = Number.parseInt(sp.s ?? "", 10);
  if (Number.isNaN(score)) return { title: `${def.title} | 여우점` };
  const clamped = clampScore(def, score);
  const result = resolveTestResult(def, clamped);
  const who = decodeNickname(sp.n);
  return {
    title: `${who ? `${who}님은 ` : ""}${result.name}! | ${def.title}`,
    description: `${result.tagline} - ${who || "나"}의 점수는 ${clamped}점. 나도 해보기!`,
  };
}

export default async function TestResultPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const def = getTestDef(slug);
  if (!def) notFound();

  const rawScore = Number.parseInt(sp.s ?? "", 10);
  // 점수 파라미터가 없으면(직접 주소 친 경우 등) 퀴즈부터 다시 풀게 보낸다.
  if (Number.isNaN(rawScore)) redirect(`/test/${slug}`);
  const score = clampScore(def, rawScore);
  const result = resolveTestResult(def, score);

  const nickname = decodeNickname(sp.n);

  // 유형별 분포 통계. 실패해도 결과 자체엔 지장 없게 조용히 0% 처리한다.
  let plays = 0;
  let typeCount = 0;
  try {
    const snap = await getDb().collection("tests").doc(def.slug).get();
    const data = snap.data() as
      | { plays?: number; results?: Record<string, number> }
      | undefined;
    plays = typeof data?.plays === "number" ? data.plays : 0;
    typeCount = typeof data?.results?.[result.id] === "number" ? (data.results[result.id] as number) : 0;
  } catch {
    // 통계 조회 실패는 무시한다.
  }
  const percent = plays > 0 ? Math.round((typeCount / plays) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 py-12">
      <div className="flex items-center justify-between">
        <Link href={`/test/${slug}`} className="text-sm font-bold text-brown/50 transition hover:text-brown">
          ← 다시 하기
        </Link>
        <Link href="/test" className="text-sm font-bold text-coral-dark transition hover:text-coral">
          다른 테스트 →
        </Link>
      </div>

      <div className="mt-6">
        <TestResultShare
          data={{
            testTitle: def.title,
            emoji: result.emoji,
            name: result.name,
            tagline: result.tagline,
            nickname,
            score,
            percent,
            theme: result.theme,
          }}
        />
      </div>

      {/* 결과 상세 - 캡처 카드 밖의 본문 */}
      <div className="mt-10 flex flex-col gap-3 rounded-3xl border border-brown/5 bg-white p-6 shadow-lg shadow-brown/5">
        <p className="text-xs font-extrabold tracking-wide text-coral-dark">RESULT</p>
        {result.description.map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-brown-soft">
            {para}
          </p>
        ))}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {result.keywords.map((k) => (
            <span key={k} className="rounded-full bg-mint/20 px-2.5 py-0.5 text-[11px] font-bold text-brown/70">
              #{k}
            </span>
          ))}
        </div>
      </div>

      {/* 복실이 한마디 */}
      <div className="mt-4 flex items-start gap-3 rounded-3xl bg-apricot/40 p-5">
        <span className="text-2xl">🦊</span>
        <p className="text-sm font-semibold leading-relaxed text-brown">{result.foxComment}</p>
      </div>

      {/* 본 서비스 연결 CTA - 이 기능의 진짜 목적 */}
      <Link
        href="/saju"
        className="mt-8 flex w-full flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-coral to-coral-dark py-5 text-center text-white shadow-xl shadow-coral-dark/25 transition active:scale-95"
      >
        <p className="text-base font-extrabold">과몰입 성향까지 알았으면,</p>
        <p className="text-lg font-extrabold">복실이와 내 사주도 봐봐! ✨</p>
        <span className="mt-2 inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">
          AI 사주풀이 · 첫 리딩 무료 체험
        </span>
      </Link>

      <p className="mt-6 text-center text-[11px] font-semibold text-brown/30">
        이 테스트는 재미로 하는 것이며 실제 성향과 다를 수 있어요 😉
      </p>
    </div>
  );
}
