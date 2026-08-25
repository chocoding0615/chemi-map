import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { refundWallet } from "@/lib/wallet";
import { callLLM, type ChatMessage } from "@/lib/llm";
import { SAJU_CHAT_SYSTEM_PROMPT } from "@/lib/result-engine/sajuPrompt";
import {
  getSajuLlmReport,
  getChatMessages,
  countUserQuestions,
  getQuestionsUsed,
  appendChatMessages,
  reserveChatQuestion,
  rollbackChatQuestion,
  SAJU_LLM_CHAT_FREE_QUESTIONS,
  SAJU_LLM_CHAT_PRICE_KRW,
} from "@/lib/sajuLlmReport";

// LLM 호출이 최대 60초까지 걸릴 수 있어서(lib/llm.ts DEFAULT_TIMEOUT_MS) Vercel의
// 기본 함수 실행 제한(설정 없으면 Hobby 기준 10초)보다 먼저 잘리지 않게 명시한다.
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("reportId") ?? "";
  if (!reportId) return NextResponse.json({ error: "reportId가 필요합니다." }, { status: 400 });

  const report = await getSajuLlmReport(session.uid, reportId);
  if (!report) return NextResponse.json({ error: "리포트를 찾을 수 없어요." }, { status: 404 });

  // POST의 과금 판정과 같은 기준(questionCount 필드)을 써야 새로고침해도
  // freeRemaining이 어긋나지 않는다 - 자세한 이유는 getQuestionsUsed 주석 참고.
  const [messages, questionsUsed] = await Promise.all([
    getChatMessages(session.uid, reportId),
    getQuestionsUsed(session.uid, reportId),
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

  // 레거시(questionCount 필드 없는) 리포트용 추정치 - 실제 판정은 트랜잭션 안에서 한다.
  const estimatedCount = await countUserQuestions(session.uid, reportId);

  // [질문 수 확인 -> 무료/유료 판정 -> 유료면 잔액 확인 후 선차감]을 트랜잭션 하나로 원자적으로
  // 처리한다. 이후 LLM 호출은 결제가 이미 확정된("reserved") 상태에서만 일어난다.
  const reserved = await reserveChatQuestion(
    session.uid,
    reportId,
    estimatedCount,
    SAJU_LLM_CHAT_PRICE_KRW,
    SAJU_LLM_CHAT_FREE_QUESTIONS
  );

  if (reserved.status === "noReport") {
    return NextResponse.json({ error: "리포트를 찾을 수 없어요." }, { status: 404 });
  }
  if (reserved.status === "insufficient") {
    return NextResponse.json({ ok: false, balance: reserved.balance, required: reserved.required }, { status: 402 });
  }

  // status === "ok" - 유료였으면 잔디는 이미 차감됐다. 아래 실패 경로 모두 되돌린다.
  // 클로저(rollback) 안에서는 타입 좁히기가 풀리므로 필요한 값들을 미리 꺼내둔다.
  const uid = session.uid;
  const { isFree } = reserved;
  const activity = { category: "상세사주 후속질문", title: message.slice(0, 40) };
  async function rollback() {
    await rollbackChatQuestion(uid, reportId);
    if (!isFree) {
      await refundWallet(uid, SAJU_LLM_CHAT_PRICE_KRW, activity);
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
    await rollback();
    const errorMessage = err instanceof Error ? err.message : "답변 생성에 실패했어요.";
    return NextResponse.json({ error: errorMessage }, { status: 502 });
  }

  try {
    await appendChatMessages(session.uid, reportId, [
      { role: "user", text: message },
      { role: "assistant", text: reply },
    ]);
  } catch {
    await rollback();
    return NextResponse.json({ error: "답변 저장에 실패했어요. 다시 시도해주세요." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    reply,
    balance: reserved.balance,
    questionsUsed: reserved.usedCount + 1,
    freeRemaining: Math.max(0, SAJU_LLM_CHAT_FREE_QUESTIONS - (reserved.usedCount + 1)),
  });
}
