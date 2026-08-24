import { getDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { SajuReportInput } from "./result-engine/sajuPrompt";

export { SAJU_LLM_REPORT_PRICE_KRW, SAJU_LLM_CHAT_FREE_QUESTIONS, SAJU_LLM_CHAT_PRICE_KRW } from "./sajuLlmPricing";

export interface SajuLlmReportDoc {
  name: string;
  birthdate: string;
  birthTime: string;
  gender: "male" | "female";
  mbti: string;
  reportText: string;
}

export interface ChatMessageDoc {
  role: "user" | "assistant";
  text: string;
}

// 같은 입력(생년월일시·성별·MBTI)이면 항상 같은 문서를 가리키게 하는 결정론적 ID —
// 이미 생성된 리포트는 재호출 없이 그대로 재사용된다(캐싱의 핵심).
export function makeReportId(input: SajuReportInput): string {
  const parts = [input.birthdate, input.birthTime || "na", input.gender, input.mbti || "na"];
  return parts.join("_").replace(/[:/.]/g, "-");
}

export async function getSajuLlmReport(uid: string, reportId: string): Promise<SajuLlmReportDoc | null> {
  const snap = await getDb().collection("users").doc(uid).collection("sajuLlmReports").doc(reportId).get();
  if (!snap.exists) return null;
  return snap.data() as SajuLlmReportDoc;
}

export interface SajuLlmReportSummary extends SajuLlmReportDoc {
  id: string;
  createdAt: string;
}

// 마이페이지 "이전 운세보기"용 — 리포트 본문 없이 목록에 필요한 필드만.
export async function listSajuLlmReports(uid: string, limit = 20): Promise<SajuLlmReportSummary[]> {
  const snap = await getDb()
    .collection("users")
    .doc(uid)
    .collection("sajuLlmReports")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((doc) => {
    const data = doc.data() as SajuLlmReportDoc & { createdAt?: { toDate: () => Date } };
    return { ...data, id: doc.id, createdAt: (data.createdAt?.toDate() ?? new Date()).toISOString() };
  });
}

// 잔디는 지금 무료 충전이라(실제 결제 연동 전) 신규 리포트 생성 횟수 자체를 하루 단위로
// 제한해둔다 — 캐시된 리포트 재조회는 여기 안 걸림(LLM 재호출이 아니라서 비용 없음).
export async function countTodayReports(uid: string): Promise<number> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const snap = await getDb()
    .collection("users")
    .doc(uid)
    .collection("sajuLlmReports")
    .where("createdAt", ">=", startOfToday)
    .get();
  return snap.size;
}

export async function saveSajuLlmReport(uid: string, reportId: string, input: SajuReportInput, reportText: string): Promise<void> {
  await getDb()
    .collection("users")
    .doc(uid)
    .collection("sajuLlmReports")
    .doc(reportId)
    .set({
      name: input.name?.trim() || "",
      birthdate: input.birthdate,
      birthTime: input.birthTime || "",
      gender: input.gender,
      mbti: input.mbti || "",
      reportText,
      createdAt: FieldValue.serverTimestamp(),
    });
}

function messagesRef(uid: string, reportId: string) {
  return getDb().collection("users").doc(uid).collection("sajuLlmReports").doc(reportId).collection("messages");
}

export async function getChatMessages(uid: string, reportId: string): Promise<ChatMessageDoc[]> {
  const snap = await messagesRef(uid, reportId).orderBy("createdAt", "asc").get();
  return snap.docs.map((doc) => doc.data() as ChatMessageDoc);
}

export async function countUserQuestions(uid: string, reportId: string): Promise<number> {
  const snap = await messagesRef(uid, reportId).where("role", "==", "user").get();
  return snap.size;
}

export async function appendChatMessage(uid: string, reportId: string, role: "user" | "assistant", text: string): Promise<void> {
  await messagesRef(uid, reportId).add({ role, text, createdAt: FieldValue.serverTimestamp() });
}
