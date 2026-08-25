import { cookies } from "next/headers";
import { customAlphabet } from "nanoid";
import type { Timestamp } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";

const SESSION_COOKIE = "yeojujeom_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 32);

export type Provider = "kakao" | "naver";

export interface SessionUser {
  uid: string;
  provider: Provider;
  nickname: string;
  profileImageUrl: string | null;
  ticketBalance: number;
  createdAt: string;
}

export interface OAuthProfile {
  providerId: string;
  nickname: string;
  profileImageUrl: string | null;
  /** "20~29"/"20-29" 형태 원본 문자열. 동의 안 했으면 null - 그 로그인 시도에서만
   * null일 뿐 이전에 저장해둔 값을 지우면 안 되니 upsert 쪽에서 별도로 처리한다. */
  ageRange?: string | null;
}

export function makeUid(provider: Provider, providerId: string): string {
  return `${provider}_${providerId}`;
}

export async function upsertUserAndCreateSession(provider: Provider, profile: OAuthProfile): Promise<void> {
  const uid = makeUid(provider, profile.providerId);
  const db = getDb();
  const userRef = db.collection("users").doc(uid);
  const now = new Date();
  const existing = await userRef.get();

  // 이번 로그인에서 동의를 안 받았다고 이전에 받아둔 연령대를 지우면 안 되니,
  // 값이 왔을 때만 필드를 갱신한다(merge 대상에서 아예 빼는 방식).
  const ageRangeUpdate = profile.ageRange ? { ageRange: profile.ageRange } : {};

  if (existing.exists) {
    await userRef.update({
      nickname: profile.nickname,
      profileImageUrl: profile.profileImageUrl,
      lastLoginAt: now,
      ...ageRangeUpdate,
    });
  } else {
    await userRef.set({
      provider,
      providerId: profile.providerId,
      nickname: profile.nickname,
      profileImageUrl: profile.profileImageUrl,
      ticketBalance: 0,
      createdAt: now,
      lastLoginAt: now,
      ...ageRangeUpdate,
    });
  }

  const token = nanoid();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
  await db.collection("sessions").doc(token).set({ uid, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const sessionSnap = await db.collection("sessions").doc(token).get();
  if (!sessionSnap.exists) return null;

  const sessionData = sessionSnap.data() as { uid: string; expiresAt: Timestamp | Date };
  const expiresAt =
    sessionData.expiresAt instanceof Date ? sessionData.expiresAt : sessionData.expiresAt.toDate();
  if (expiresAt.getTime() < Date.now()) {
    await sessionSnap.ref.delete();
    return null;
  }

  const userSnap = await db.collection("users").doc(sessionData.uid).get();
  if (!userSnap.exists) return null;
  const user = userSnap.data() as {
    provider: Provider;
    nickname: string;
    profileImageUrl: string | null;
    ticketBalance: number;
    createdAt?: Timestamp | Date;
  };
  const createdAt = user.createdAt
    ? user.createdAt instanceof Date
      ? user.createdAt
      : user.createdAt.toDate()
    : new Date();

  return {
    uid: sessionData.uid,
    provider: user.provider,
    nickname: user.nickname,
    profileImageUrl: user.profileImageUrl,
    ticketBalance: user.ticketBalance ?? 0,
    createdAt: createdAt.toISOString(),
  };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb().collection("sessions").doc(token).delete();
  }
  cookieStore.delete(SESSION_COOKIE);
}

const OAUTH_STATE_COOKIE = "yeojujeom_oauth_state";
const OAUTH_STATE_MAX_AGE_SECONDS = 600;

export async function createOAuthState(provider: Provider): Promise<string> {
  const state = nanoid();
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, `${provider}:${state}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });
  return state;
}

export async function verifyOAuthState(provider: Provider, state: string | null): Promise<boolean> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);
  if (!stored || !state) return false;
  return stored === `${provider}:${state}`;
}
