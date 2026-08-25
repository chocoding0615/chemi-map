import { createHash } from "node:crypto";
import { getDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// 서버리스(Vercel)에서는 인메모리 카운터가 인스턴스마다 따로 놀아 의미가 없으니,
// Firestore 문서 하나를 고정 시간창(fixed window) 버킷으로 쓴다.
// 문서 ID = 엔드포인트 + IP 해시 + 창 번호 구조라, 같은 창 안에서만 경합이 걸리고
// 창이 바뀌면 자연히 새 문서에서 다시 센다.

export interface RateLimitRule {
  endpoint: string;
  limit: number;
  windowMs: number;
}

// 공개(비로그인) 엔드포인트별 규칙. 학교/회사처럼 한 IP를 여러 사람이 쓰는 NAT 상황도
// 있으니, 사람에겐 충분하고 반복 스팸엔 성가신 수준으로 잡았다. 필요하면 여기 숫자만 고치면 된다.
export const RATE_LIMITS = {
  /** 비밀 편지 전송: 시간당 10통 */
  letters: { endpoint: "letters", limit: 10, windowMs: 60 * 60 * 1000 },
  /** 인연지도 방명록 작성: 시간당 20건 */
  mapEntries: { endpoint: "map_entries", limit: 20, windowMs: 60 * 60 * 1000 },
} satisfies Record<string, RateLimitRule>;

// 프록시 체인의 맨 앞이 실제 클라이언트 IP다. Vercel은 항상 x-forwarded-for를 세팅한다.
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return headers.get("x-real-ip") ?? "";
}

export interface RateLimitResult {
  ok: boolean;
  /** 차단됐을 때만 있음 - 다음 창까지 남은 초. 응답의 Retry-After 헤더로 그대로 쓴다. */
  retryAfterSeconds?: number;
}

export async function checkRateLimit(ip: string, rule: RateLimitRule): Promise<RateLimitResult> {
  // IP를 못 얻으면(프록시 설정 이상 등) 제한을 끄고 통과시킨다(fail-open).
  // 식별 불가능한 클라이언트 전부를 한 버킷에 몰아넣어 정상 사용자를 막는 것보다 낫다.
  if (!ip) return { ok: true };

  // 원본 IP를 저장하지 않고 해시만 남긴다 - 개인정보 최소 수집.
  const ipHash = createHash("sha256")
    .update(`yeojujeom:${ip}`)
    .digest("hex")
    .slice(0, 32);

  const now = Date.now();
  const windowKey = Math.floor(now / rule.windowMs);
  const docRef = getDb().collection("rateLimits").doc(`${rule.endpoint}_${ipHash}_${windowKey}`);
  const retryAfterSeconds = Math.ceil(((windowKey + 1) * rule.windowMs - now) / 1000);

  const allowed = await getDb().runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    const data = snap.data();
    const count = typeof data?.count === "number" ? data.count : 0;
    if (count >= rule.limit) return false;
    tx.set(
      docRef,
      {
        count: count + 1,
        endpoint: rule.endpoint,
        // Firestore 콘솔에서 이 컬렉션에 TTL 정책을 걸면 지난 창 문서들이 자동 청소된다.
        expireAt: new Date((windowKey + 1) * rule.windowMs),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  });

  return allowed ? { ok: true } : { ok: false, retryAfterSeconds };
}
