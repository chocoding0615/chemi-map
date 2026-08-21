import { getDb } from "./firebaseAdmin";

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
