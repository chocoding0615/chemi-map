import Link from "next/link";
import FoxMascot from "@/components/FoxMascot";
import { TESTS } from "@/lib/content/tests";

export const metadata = { title: "심테 놀이터 | 여우점" };

// 바이럴 테스트 시리즈의 허브. 새 테스트는 lib/content/tests.ts에 데이터만 추가하면 여기에 자동으로 나타난다.
export default function TestHubPage() {
  const tests = Object.values(TESTS);
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 py-14">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm font-bold text-brown/50 transition hover:text-brown">
          ← 홈
        </Link>
      </div>

      <div className="mt-4 flex flex-col items-center text-center">
        <FoxMascot size={64} prop="star" />
        <p className="mt-3 text-sm font-bold text-coral-dark">10초 문항, 무한 과몰입</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-brown">여우점 심테 놀이터</h1>
        <p className="mt-2 text-xs leading-relaxed text-brown-soft">
          로그인 없이 바로 해요. 결과 카드 저장해서 친구한테 던지세요!
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {tests.map((t) => (
          <Link
            key={t.slug}
            href={`/test/${t.slug}`}
            className="flex flex-col gap-1 rounded-3xl border border-brown/5 bg-white p-6 shadow-lg shadow-brown/5 transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="text-4xl">{t.emoji}</span>
            <p className="mt-2 text-lg font-extrabold text-brown">{t.title}</p>
            <p className="text-xs leading-relaxed text-brown-soft">{t.subtitle}</p>
            <span className="mt-2 inline-flex w-fit rounded-full bg-coral/10 px-2.5 py-0.5 text-[11px] font-bold text-coral-dark">
              {t.questions.length}문항 · 약 40초 · 무료
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center text-[11px] font-semibold text-brown/30">
        새로운 테스트가 계속 추가돼요 🦊
      </p>
    </div>
  );
}
