import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TestRunner from "@/components/test/TestRunner";
import { getTestDef } from "@/lib/content/tests";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const def = getTestDef(slug);
  if (!def) return { title: "테스트 | 여우점" };
  return {
    title: `${def.title} | 여우점 심테`,
    description: def.subtitle,
  };
}

export default async function TestQuizPage({ params }: Props) {
  const { slug } = await params;
  const def = getTestDef(slug);
  if (!def) notFound();

  // 결과 데이터까지 통째로 넘겨도 공개 콘텐츠라 상관없지만, 번들을 줄이고
  // "결과는 끝나고 나와야 재밌다"는 맛을 지키려고 문항만 넘긴다.
  return (
    <TestRunner
      def={{ ...def, results: [] }}
    />
  );
}
