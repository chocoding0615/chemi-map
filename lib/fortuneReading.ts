import { getDb } from "./firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { CategorySlug } from "@/lib/content/fortuneCategories";
import type { FortunePersonInput } from "./result-engine/fortunePrompt";

// 운세 카테고리 특화 AI 리딩의 저장/결제 원자성 담당. lib/sajuLlmReport.ts의
// reserveReportSlot 트랜잭션 패턴을 그대로 따르되, 컬렉션만 분리한다(users/{uid}/fortuneReadings).
// 공용 파일을 고치지 않고 독립적으로 두는 이유: 사주 리포트와 운세 리딩의 캐시키 구조가 달라서
// (카테고리+두 사람 입력) 나중에 각자 진화하기 편하게 하기 위함이다.

const GENERATING_STALE_MS = 120_000;

// 잔디는 무료 충전이라 생성 자체를 하루 단위로 제한한다(사주 AI리포트와 동일 정책).
export const DAILY_READING_LIMIT = 5;

export interface FortuneReadingDoc {
  slug: CategorySlug;
  categoryKo: string;
  names: string;
  readingText: string;
}

interface ReadingDocRaw {
  status?: "generating";
  reservedAt?: Timestamp;
}

// 같은 입력이면 항상 같은 문서를 가리키는 결정론적 ID - 재요청 시 LLM 재호출 없이 캐시 재사용.
// 궁합처럼 두 사람 입력이 필요한 카테고리는 상대 정보도 키에 포함한다(MBTI 변경분까지).
function personKey(p: FortunePersonInput): string {
  return [p.birthdate, p.birthTime || "na", p.gender, p.mbti || "na"].join("-");
}

export function makeReadingId(
  slug: CategorySlug,
  me: FortunePersonInput,
  partner?: FortunePersonInput,
  purpose?: string
): string {
  const parts = [slug, personKey(me)];
  if (partner) parts.push(personKey(partner));
  // 택일처럼 같은 사람이라도 목적에 따라 결과가 달라지는 카테고리는 캐시키에 목적을 포함한다.
  // (안 그러면 "이사"로 생성한 리딩이 "결혼식" 요청에서 그대로 재사용되는 버그가 된다.)
  if (purpose?.trim()) parts.push(purpose.trim());
  return parts.join("_").replace(/[:/.]/g, "-");
}

export async function getFortuneReading(uid: string, readingId: string): Promise<FortuneReadingDoc | null> {
  const snap = await getDb().collection("users").doc(uid).collection("fortuneReadings").doc(readingId).get();
  if (!snap.exists) return null;
  const data = snap.data() as FortuneReadingDoc & ReadingDocRaw;
  // 아직 생성 중인 선점 문서는 완성된 리딩이 아니므로 "없음"과 동일하게 취급한다.
  if (data.status === "generating") return null;
  return data;
}

export type ReserveReadingResult =
  | { status: "cached"; readingText: string }
  | { status: "inProgress" }
  | { status: "insufficient"; balance: number; required: number }
  | { status: "limit" }
  | { status: "reserved"; balance: number };

// [캐시 확인 -> 잔액 확인 -> 일일 한도 확인 -> 선차감 -> 선점 문서 기록]을 트랜잭션 하나로 묶는다.
// LLM 호출(비용 발생) 전에 결제가 원자적으로 확정되고, 같은 readingId로 동시 요청이 와도
// 하나만 reserved를 받는다(나머지는 inProgress).
export async function reserveReadingSlot(
  uid: string,
  readingId: string,
  priceKrw: number,
  dailyLimit: number,
  activity: { category: string; title: string }
): Promise<ReserveReadingResult> {
  const db = getDb();
  const userRef = db.collection("users").doc(uid);
  const readingsRef = userRef.collection("fortuneReadings");
  const readingRef = readingsRef.doc(readingId);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayQuery = readingsRef.where("createdAt", ">=", startOfToday);

  return db.runTransaction(async (tx) => {
    // 트랜잭션 안에서는 모든 읽기가 쓰기보다 먼저 와야 한다.
    const [readingSnap, userSnap, todaySnap] = await Promise.all([
      tx.get(readingRef),
      tx.get(userRef),
      tx.get(todayQuery),
    ]);

    const existing = readingSnap.exists ? (readingSnap.data() as FortuneReadingDoc & ReadingDocRaw) : null;
    if (existing) {
      if (existing.status !== "generating") {
        return { status: "cached", readingText: existing.readingText } as const;
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
    tx.set(readingRef, { status: "generating", reservedAt: FieldValue.serverTimestamp() });

    return { status: "reserved", balance: nextBalance } as const;
  });
}

// 선점 후 LLM 호출/저장이 실패했을 때 선점 문서를 지운다 - 남아있으면 다음 요청이
// GENERATING_STALE_MS만큼 불필요하게 기다리게 된다.
export async function abandonReadingReservation(uid: string, readingId: string): Promise<void> {
  await getDb().collection("users").doc(uid).collection("fortuneReadings").doc(readingId).delete();
}

export async function saveFortuneReading(
  uid: string,
  readingId: string,
  meta: { slug: CategorySlug; categoryKo: string; names: string },
  readingText: string
): Promise<void> {
  await getDb()
    .collection("users")
    .doc(uid)
    .collection("fortuneReadings")
    .doc(readingId)
    .set({
      slug: meta.slug,
      categoryKo: meta.categoryKo,
      names: meta.names,
      readingText,
      createdAt: FieldValue.serverTimestamp(),
    });
}
