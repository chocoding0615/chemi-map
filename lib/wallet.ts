import { getDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export type ChargeResult = { ok: true; balance: number } | { ok: false; balance: number; required: number };

// 잔디 잔액 차감 + 활동 기록의 유일한 지점. 사주/궁합/인연지도(MockPayGate)든
// 비밀편지든 유료 콘텐츠를 여는 모든 경로가 이 함수 하나만 거쳐야, 화면에 보이는
// 잔액과 실제 차감이 어긋나지 않는다.
export async function chargeWallet(
  uid: string,
  amountKrw: number,
  activity: { category: string; title: string }
): Promise<ChargeResult> {
  const db = getDb();
  const userRef = db.collection("users").doc(uid);

  const result = await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const balance = (userSnap.data()?.ticketBalance as number | undefined) ?? 0;

    if (amountKrw > 0 && balance < amountKrw) {
      return { ok: false, balance, required: amountKrw } as const;
    }

    const nextBalance = balance - amountKrw;
    if (amountKrw > 0) {
      tx.update(userRef, { ticketBalance: nextBalance });
    }
    tx.set(userRef.collection("activity").doc(), {
      category: activity.category,
      title: activity.title,
      priceKrw: amountKrw,
      unlockedAt: FieldValue.serverTimestamp(),
    });

    return { ok: true, balance: nextBalance } as const;
  });

  return result;
}

// 이미 구매한 상품인지 확인 — MockPayGate가 마운트 시 이걸로 재결제를 막는다.
// 환불된 건(isRefund)은 구매로 안 쳐서, 환불 후 재진입하면 다시 결제할 수 있게 한다.
export async function hasPurchased(uid: string, category: string, title: string): Promise<boolean> {
  const db = getDb();
  const snap = await db
    .collection("users")
    .doc(uid)
    .collection("activity")
    .where("category", "==", category)
    .where("title", "==", title)
    .limit(5)
    .get();
  return snap.docs.some((doc) => !doc.data().isRefund);
}

// 선차감 후 처리가 실패했을 때(LLM 호출 실패, 저장 실패 등) 잔액을 되돌리는 유일한 지점.
// activity에 isRefund: true를 남겨 일반 결제 내역과 구분한다.
export async function refundWallet(
  uid: string,
  amountKrw: number,
  activity: { category: string; title: string }
): Promise<void> {
  if (amountKrw <= 0) return;
  const db = getDb();
  const userRef = db.collection("users").doc(uid);

  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const balance = (userSnap.data()?.ticketBalance as number | undefined) ?? 0;
    tx.update(userRef, { ticketBalance: balance + amountKrw });
    tx.set(userRef.collection("activity").doc(), {
      category: activity.category,
      title: activity.title,
      priceKrw: -amountKrw,
      isRefund: true,
      unlockedAt: FieldValue.serverTimestamp(),
    });
  });
}
