import { getDb } from "./firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
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

// 선점(reserved) 문서가 이 시간보다 오래됐으면 죽은 시도로 보고 새 요청이 덮어쓸 수 있게 한다 —
// LLM 호출 타임아웃(Phase 2, 기본 60초)보다 넉넉히 길게 잡아 정상 처리 중인 요청을 오판하지 않는다.
const GENERATING_STALE_MS = 120_000;

interface ReportDocRaw {
  status?: "generating";
  reservedAt?: Timestamp;
  reportText?: string;
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
  const data = snap.data() as SajuLlmReportDoc & ReportDocRaw;
  // 아직 생성 중인 선점 문서는 완성된 리포트가 아니므로 "없음"과 동일하게 취급한다.
  if (data.status === "generating") return null;
  return data;
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

export type ReserveResult =
  | { status: "cached"; reportText: string }
  | { status: "inProgress" }
  | { status: "insufficient"; balance: number; required: number }
  | { status: "limit" }
  | { status: "reserved"; balance: number };

// [캐시 확인 → 잔액 확인 → 일일 한도 확인 → 선차감 → 선점 문서 기록]을 트랜잭션 하나로
// 묶는다. 이렇게 해야 LLM 호출(비용 발생) 전에 결제가 원자적으로 확정되고, 같은
// reportId로 동시에 두 요청이 들어와도 하나만 "reserved"를 받는다(나머지는 inProgress).
export async function reserveReportSlot(
  uid: string,
  reportId: string,
  priceKrw: number,
  dailyLimit: number,
  activity: { category: string; title: string }
): Promise<ReserveResult> {
  const db = getDb();
  const userRef = db.collection("users").doc(uid);
  const reportsRef = userRef.collection("sajuLlmReports");
  const reportRef = reportsRef.doc(reportId);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayQuery = reportsRef.where("createdAt", ">=", startOfToday);

  return db.runTransaction(async (tx) => {
    // 트랜잭션 안에서는 모든 읽기가 쓰기보다 먼저 와야 한다.
    const [reportSnap, userSnap, todaySnap] = await Promise.all([
      tx.get(reportRef),
      tx.get(userRef),
      tx.get(todayQuery),
    ]);

    const existing = reportSnap.exists ? (reportSnap.data() as SajuLlmReportDoc & ReportDocRaw) : null;
    if (existing) {
      if (existing.status !== "generating") {
        return { status: "cached", reportText: existing.reportText! } as const;
      }
      const reservedAtMs = existing.reservedAt?.toMillis() ?? 0;
      const isStale = Date.now() - reservedAtMs > GENERATING_STALE_MS;
      if (!isStale) {
        return { status: "inProgress" } as const;
      }
      // 이전 시도가 죽은 것으로 보고(타임아웃보다 한참 지남) 이 요청이 새로 선점한다.
    }

    const balance = (userSnap.data()?.ticketBalance as number | undefined) ?? 0;
    if (priceKrw > 0 && balance < priceKrw) {
      return { status: "insufficient", balance, required: priceKrw } as const;
    }
    if (todaySnap.size >= dailyLimit) {
      return { status: "limit" } as const;
    }

    const nextBalance = balance - priceKrw;
    if (priceKrw > 0) {
      tx.update(userRef, { ticketBalance: nextBalance });
    }
    tx.set(userRef.collection("activity").doc(), {
      category: activity.category,
      title: activity.title,
      priceKrw,
      unlockedAt: FieldValue.serverTimestamp(),
    });
    tx.set(reportRef, { status: "generating", reservedAt: FieldValue.serverTimestamp() });

    return { status: "reserved", balance: nextBalance } as const;
  });
}

// 선점 후 LLM 호출/저장이 실패했을 때 선점 문서를 지운다 — 남아있으면 다음 요청이
// GENERATING_STALE_MS만큼 불필요하게 기다리게 된다.
export async function abandonReservation(uid: string, reportId: string): Promise<void> {
  await getDb().collection("users").doc(uid).collection("sajuLlmReports").doc(reportId).delete();
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
