import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSajuLlmReport } from "@/lib/sajuLlmReport";
import SimpleMarkdown from "@/components/SimpleMarkdown";

interface ReportPageProps {
  params: Promise<{ reportId: string }>;
}

export default async function SajuLlmReportPage({ params }: ReportPageProps) {
  const { reportId } = await params;
  const session = await getSession();
  if (!session) redirect("/my");

  const report = await getSajuLlmReport(session.uid, reportId);
  if (!report) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 py-10">
      <Link href="/my" className="text-xs font-semibold text-brown-soft/60">
        ← 마이페이지로
      </Link>
      <p className="mt-3 text-xs font-bold text-coral-dark">🔮 AI 상세 사주 리포트</p>
      <h1 className="mt-1 text-xl font-extrabold text-brown">
        {report.name ? `${report.name}님의 사주` : "나의 사주"}
      </h1>
      <p className="mt-1 text-xs text-brown-soft/60">
        {report.birthdate} {report.birthTime && `· ${report.birthTime}`} · {report.gender === "male" ? "남" : "여"}
        {report.mbti && ` · ${report.mbti}`}
      </p>

      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brown/10">
        <SimpleMarkdown text={report.reportText} />
      </div>
    </div>
  );
}
