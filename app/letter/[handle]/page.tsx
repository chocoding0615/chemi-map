import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FoxMascot from "@/components/FoxMascot";
import SecretLetterForm from "@/components/SecretLetterForm";
import { resolveLetterHandle } from "@/lib/letterHandle";

interface LetterHandlePageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: LetterHandlePageProps): Promise<Metadata> {
  const { handle } = await params;
  const resolved = await resolveLetterHandle(handle);
  return { title: resolved ? `${resolved.nickname}님에게 비밀 편지 쓰기 · 여우점` : "여우점" };
}

export default async function LetterHandlePage({ params }: LetterHandlePageProps) {
  const { handle } = await params;
  const resolved = await resolveLetterHandle(handle);
  if (!resolved) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop="heart" />
      <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-brown">
        {resolved.nickname}님에게
        <br />
        비밀 편지 쓰기
      </h1>
      <p className="mt-2 text-center text-sm text-brown-soft">
        누가 보냈는지는 본인이 원할 때만 알 수 있어요.
      </p>

      <SecretLetterForm handle={handle} />
    </div>
  );
}
