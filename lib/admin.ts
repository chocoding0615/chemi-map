import { getDb } from "./firebaseAdmin";

// 관리자 판별: ADMIN_UIDS 환경변수(콤마 구분)에 있으면 항상 관리자 —
// Firestore 데이터가 잘못돼도 대표님 계정이 잠기지 않도록 하는 최후 방어선.
// 그 외에는 Firestore users/{uid}.isAdmin 플래그로 판별하며, 이건 관리자가
// "관리자 지정" 탭에서 다른 계정에 부여/회수할 수 있다.
function envAdminUids(): Set<string> {
  return new Set(
    (process.env.ADMIN_UIDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export async function isAdmin(uid: string): Promise<boolean> {
  if (envAdminUids().has(uid)) return true;
  const snap = await getDb().collection("users").doc(uid).get();
  return snap.data()?.isAdmin === true;
}

export function isEnvAdmin(uid: string): boolean {
  return envAdminUids().has(uid);
}
