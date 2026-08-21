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
