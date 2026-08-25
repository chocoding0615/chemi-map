import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { chargeWallet } from "@/lib/wallet";
import { callLLM, type ChatMessage } from "@/lib/llm";
import { SAJU_CHAT_SYSTEM_PROMPT } from "@/lib/result-engine/sajuPrompt";
import {
  getSajuLlmReport,
  getChatMessages,
  countUserQuestions,
  appendChatMessage,
  SAJU_LLM_CHAT_FREE_QUESTIONS,
  SAJU_LLM_CHAT_PRICE_KRW,
} from "@/lib/sajuLlmReport";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("reportId") ?? "";
  if (!reportId) return NextResponse.json({ error: "reportId가 필요합니다." }, { status: 400 });

  const report = await getSajuLlmReport(session.uid, reportId);
  if (!report) return NextResponse.json({ error: "리포트를 찾을 수 없어요." }, { status: 404 });

  const [messages, questionsUsed] = await Promise.all([
    getChatMessages(session.uid, reportId),
    countUserQuestions(session.uid, reportId),
  ]);

  return NextResponse.json({ messages, questionsUsed });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const reportId = typeof body?.reportId === "string" ? body.reportId : "";
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 300) : "";
  if (!reportId || !message) return NextResponse.json({ error: "reportId와 message가 필요합니다." }, { status: 400 });

  const report = await getSajuLlmReport(session.uid, reportId);
  if (!report) return NextResponse.json({ error: "리포트를 찾을 수 없어요." }, { status: 404 });

  const questionsUsed = await countUserQuestions(session.uid, reportId);
  const isFree = questionsUsed < SAJU_LLM_CHAT_FREE_QUESTIONS;

  if (!isFree) {
    if (session.ticketBalance < SAJU_LLM_CHAT_PRICE_KRW) {
      return NextResponse.json(
        { ok: false, balance: session.ticketBalance, required: SAJU_LLM_CHAT_PRICE_KRW },
        { status: 402 }
      );
    }
  }

  const history = await getChatMessages(session.uid, reportId);
  const messages: ChatMessage[] = [
    { role: "system", content: `${SAJU_CHAT_SYSTEM_PROMPT}\n\n[앞서 작성한 리포트]\n${report.reportText}` },
    ...history.map((m): ChatMessage => ({ role: m.role, content: m.text })),
    { role: "user", content: message },
  ];

  let reply: string;
  try {
    reply = await callLLM(messages, 1200);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "답변 생성에 실패했어요.";
    return NextResponse.json({ error: errorMessage }, { status: 502 });
  }

  let balance = session.ticketBalance;
  if (!isFree) {
    const chargeResult = await chargeWallet(session.uid, SAJU_LLM_CHAT_PRICE_KRW, {
      category: "상세사주 후속질문",
      title: message.slice(0, 40),
    });
    if (!chargeResult.ok) {
      return NextResponse.json({ ok: false, balance: chargeResult.balance, required: chargeResult.required }, { status: 402 });
    }
    balance = chargeResult.balance;
  }

  await appendChatMessage(session.uid, reportId, "user", message);
  await appendChatMessage(session.uid, reportId, "assistant", reply);

  return NextResponse.json({
    ok: true,
    reply,
    balance,
    questionsUsed: questionsUsed + 1,
    freeRemaining: Math.max(0, SAJU_LLM_CHAT_FREE_QUESTIONS - (questionsUsed + 1)),
  });
}
