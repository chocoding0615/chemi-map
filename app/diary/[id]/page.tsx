import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FoxMascot from "@/components/FoxMascot";
import { DIARY_ENTRIES, getDiaryEntry } from "@/lib/content/diary";

interface DiaryDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return DIARY_ENTRIES.map((entry) => ({ id: entry.id }));
}

export async function generateMetadata({ params }: DiaryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = getDiaryEntry(id);
  return { title: entry ? `${entry.title} · 복실이의 비밀일기` : "복실이의 비밀일기 · 여우점" };
}

export default async function DiaryDetailPage({ params }: DiaryDetailPageProps) {
  const { id } = await params;
  const entry = getDiaryEntry(id);
  if (!entry) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="heart" />
      <p className="mt-4 text-xs font-semibold text-lavender-dark">{entry.dateLabel}</p>
      <h1 className="mt-1 text-center text-2xl font-extrabold tracking-tight text-brown">
        {entry.emoji} {entry.title}
      </h1>

      <div className="mt-8 w-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brown/5">
        <p className="text-sm leading-relaxed text-brown-soft/80">{entry.body}</p>
      </div>

      <Link
        href="/diary"
        className="mt-6 text-sm font-semibold text-coral-dark underline underline-offset-2"
      >
        다른 이야기 보러 가기
      </Link>
    </div>
  );
}
