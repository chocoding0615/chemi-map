import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { refundWallet } from "@/lib/wallet";
import { callLLM } from "@/lib/llm";
import { buildSajuFactSheet, SAJU_REPORT_SYSTEM_PROMPT, type SajuReportInput } from "@/lib/result-engine/sajuPrompt";
import {
  saveSajuLlmReport,
  makeReportId,
  reserveReportSlot,
  abandonReservation,
  SAJU_LLM_REPORT_PRICE_KRW,
} from "@/lib/sajuLlmReport";
import { MBTI_TYPES } from "@/lib/result-engine/temperament";

const DAILY_REPORT_LIMIT = 5;

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
  const activity = {
    category: "상세사주 AI리포트",
    title: `${input.name?.trim() || "나"}님의 상세 사주 리포트`,
  };

  // 캐시 확인 → 잔액 확인 → 일일 한도 확인 → 선차감을 트랜잭션 하나로 원자적으로 처리한다.
  // 이후 LLM 호출은 결제가 이미 확정된("reserved") 경우에만 일어난다.
  const reserved = await reserveReportSlot(session.uid, reportId, SAJU_LLM_REPORT_PRICE_KRW, DAILY_REPORT_LIMIT, activity);

  if (reserved.status === "cached") {
    return NextResponse.json({
      ok: true,
      reportText: reserved.reportText,
      reportId,
      cached: true,
      balance: session.ticketBalance,
    });
  }
  if (reserved.status === "inProgress") {
    return NextResponse.json({ error: "리포트를 만들고 있어요. 잠시 후 다시 시도해주세요." }, { status: 409 });
  }
  if (reserved.status === "insufficient") {
    return NextResponse.json({ ok: false, balance: reserved.balance, required: reserved.required }, { status: 402 });
  }
  if (reserved.status === "limit") {
    return NextResponse.json(
      { error: "오늘 생성 가능한 AI 리포트 횟수를 다 쓰셨어요. 내일 다시 시도해주세요." },
      { status: 429 }
    );
  }

  // status === "reserved" — 잔디는 이미 차감됐다. 아래 두 실패 경로 모두 반드시 환불한다.
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
    await refundWallet(session.uid, SAJU_LLM_REPORT_PRICE_KRW, activity);
    await abandonReservation(session.uid, reportId);
    const message = err instanceof Error ? err.message : "리포트 생성에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  try {
    await saveSajuLlmReport(session.uid, reportId, input, reportText);
  } catch {
    await refundWallet(session.uid, SAJU_LLM_REPORT_PRICE_KRW, activity);
    await abandonReservation(session.uid, reportId);
    return NextResponse.json({ error: "리포트 저장에 실패했어요. 다시 시도해주세요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reportText, reportId, cached: false, balance: reserved.balance });
}
