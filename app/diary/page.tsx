import Link from "next/link";
import FoxMascot from "@/components/FoxMascot";
import { DIARY_ENTRIES } from "@/lib/content/diary";

export const metadata = { title: "복실이의 비밀일기 · 여우점" };

export default function DiaryListPage() {
  return (
    <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="heart" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">복실이의 비밀일기</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft">
        아기 구미호 복실이의 세계관 이야기예요
      </p>

      <div className="mt-8 w-full space-y-3">
        {DIARY_ENTRIES.map((entry) => (
          <Link
            key={entry.id}
            href={`/diary/${entry.id}`}
            className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brown/5 transition active:scale-[0.98] hover:bg-apricot/40"
          >
            <span className="text-2xl">{entry.emoji}</span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-lavender-dark">{entry.dateLabel}</p>
              <p className="font-bold text-brown">{entry.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-brown-soft">{entry.teaser}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
