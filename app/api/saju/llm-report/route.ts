import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { chargeWallet } from "@/lib/wallet";
import { callLLM } from "@/lib/llm";
import { buildSajuFactSheet, SAJU_REPORT_SYSTEM_PROMPT, type SajuReportInput } from "@/lib/result-engine/sajuPrompt";
import { getSajuLlmReport, saveSajuLlmReport, makeReportId, SAJU_LLM_REPORT_PRICE_KRW } from "@/lib/sajuLlmReport";
import { MBTI_TYPES } from "@/lib/result-engine/temperament";

function parseInput(body: unknown): SajuReportInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const birthdate = typeof b.birthdate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.birthdate) ? b.birthdate : null;
  const gender = b.gender === "male" || b.gender === "female" ? b.gender : null;
  if (!birthdate || !gender) return null;

  const birthTime = typeof b.birthTime === "string" && /^\d{2}:\d{2}$/.test(b.birthTime) ? b.birthTime : undefined;
  const mbti = typeof b.mbti === "string" && MBTI_TYPES.includes(b.mbti as (typeof MBTI_TYPES)[number]) ? (b.mbti as SajuReportInput["mbti"]) : undefined;
  const name = typeof b.name === "string" ? b.name.slice(0, 20) : undefined;

  return { birthdate, gender, birthTime, mbti, name };
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const input = parseInput(body);
  if (!input) return NextResponse.json({ error: "생년월일과 성별이 필요합니다." }, { status: 400 });

  const reportId = makeReportId(input);

  const existing = await getSajuLlmReport(session.uid, reportId);
  if (existing) {
    return NextResponse.json({ ok: true, reportText: existing.reportText, reportId, cached: true, balance: session.ticketBalance });
  }

  if (session.ticketBalance < SAJU_LLM_REPORT_PRICE_KRW) {
    return NextResponse.json(
      { ok: false, balance: session.ticketBalance, required: SAJU_LLM_REPORT_PRICE_KRW },
      { status: 402 }
    );
  }

  let reportText: string;
  try {
    const factSheet = buildSajuFactSheet(input);
    reportText = await callLLM(
      [
        { role: "system", content: SAJU_REPORT_SYSTEM_PROMPT },
        { role: "user", content: factSheet },
      ],
      8000
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "리포트 생성에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const chargeResult = await chargeWallet(session.uid, SAJU_LLM_REPORT_PRICE_KRW, {
    category: "상세사주 AI리포트",
    title: `${input.name?.trim() || "나"}님의 상세 사주 리포트`,
  });
  if (!chargeResult.ok) {
    return NextResponse.json({ ok: false, balance: chargeResult.balance, required: chargeResult.required }, { status: 402 });
  }

  await saveSajuLlmReport(session.uid, reportId, input, reportText);

  return NextResponse.json({ ok: true, reportText, reportId, cached: false, balance: chargeResult.balance });
}
