import { getDb } from "./firebaseAdmin";

// 편지 하나 여는 가격(첫 편지 제외) — 표시 가격(inbox 페이지)과 실제 과금 로직(unlock
// 라우트) 둘 다 이 값 하나만 써야 화면 가격과 실제 차감이 어긋나지 않는다.
export const LETTER_UNLOCK_PRICE_KRW = 1;

// 한 사람의 편지함에 쌓일 수 있는 최대 편지 수 — 스팸성 도배를 막기 위한 안전장치.
// POST /api/letters가 이 함수로 보내기 전에 미리 확인한다.
export const MAX_LETTERS_PER_INBOX = 300;

export async function countLetters(uid: string): Promise<number> {
  const snap = await getDb().collection("users").doc(uid).collection("letters").count().get();
  return snap.data().count;
}

// 편지함의 "첫 편지는 무료" 규칙을 판단하는 유일한 기준점 —
// 표시 가격(inbox 페이지)과 실제 과금 로직(unlock 라우트) 둘 다 이 함수를 써야
// 화면에 보이는 가격과 실제 처리되는 가격이 어긋나지 않는다.
export async function hasUnlockedAnyLetter(uid: string): Promise<boolean> {
  const snap = await getDb()
    .collection("users")
    .doc(uid)
    .collection("letters")
    .where("unlockedAt", "!=", null)
    .count()
    .get();
  return snap.data().count > 0;
}
