import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/firebaseAdmin";
import { hasUnlockedAnyLetter, LETTER_UNLOCK_PRICE_KRW } from "@/lib/letters";
import { FieldValue } from "firebase-admin/firestore";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// [이미 열림 확인 -> 잔액 확인 -> 선차감 -> unlock 표시]를 트랜잭션 하나로 묶는다.
// 예전엔 확인 없이 곧바로 차감해서, 이미 열린 편지를 재요청하면 유료로 또 깎이는 버그가
// 있었다(첫 편지 무료 로직과도 어긋남). 지금은 같은 요청을 몇 번 보내도 한 번만 과금되는
// 멱등 구조라 더블클릭·재시도·직접 API 호출 모두 안전하다.
export async function POST(_request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  const userRef = db.collection("users").doc(session.uid);
  const letterRef = userRef.collection("letters").doc(id);

  const letterSnap = await letterRef.get();
  if (!letterSnap.exists) return NextResponse.json({ error: "편지를 찾을 수 없어요." }, { status: 404 });
  const senderName = (letterSnap.data() as { senderName: string }).senderName;

  // "첫 편지 무료" 판정은 다른 편지 문서들을 읽어야 해서 트랜잭션 밖에서 계산한다.
  // 동시에 서로 다른 두 편지를 처음 열면 둘 다 무료 처리될 수 있지만 기존 동작도 동일하고
  // 소액이라 감수한다. 반면 "같은 편지 중복 과금"은 아래 트랜잭션이 완벽히 막는다.
  const priceKrw = (await hasUnlockedAnyLetter(session.uid)) ? LETTER_UNLOCK_PRICE_KRW : 0;

  const result = await db.runTransaction(async (tx) => {
    // 트랜잭션 안에서는 모든 읽기가 쓰기보다 먼저 와야 한다.
    const [freshSnap, userSnap] = await Promise.all([tx.get(letterRef), tx.get(userRef)]);
    if (!freshSnap.exists) return { status: "notFound" } as const;

    // 이미 열린 편지면 돈 받지 않고 성공 처리 - 여기가 이번 수정의 핵심.
    if ((freshSnap.data() as { unlockedAt?: unknown }).unlockedAt) {
      return {
        status: "already",
        balance: (userSnap.data()?.ticketBalance as number | undefined) ?? 0,
      } as const;
    }

    const balance = (userSnap.data()?.ticketBalance as number | undefined) ?? 0;
    if (priceKrw > 0 && balance < priceKrw) {
      return { status: "insufficient", balance, required: priceKrw } as const;
    }

    const nextBalance = balance - priceKrw;
    if (priceKrw > 0) {
      tx.update(userRef, { ticketBalance: nextBalance });
    }
    tx.set(userRef.collection("activity").doc(), {
      category: "비밀 편지",
      title: `${senderName}님이 보낸 편지`,
      priceKrw,
      unlockedAt: FieldValue.serverTimestamp(),
    });
    tx.update(letterRef, { unlockedAt: FieldValue.serverTimestamp() });

    return { status: "ok", balance: nextBalance } as const;
  });

  if (result.status === "notFound") {
    return NextResponse.json({ error: "편지를 찾을 수 없어요." }, { status: 404 });
  }
  if (result.status === "insufficient") {
    return NextResponse.json({ ok: false, balance: result.balance, required: result.required }, { status: 402 });
  }

  // alreadyUnlocked: 클라가 "방금 열림" 연출을 할지 말지 알 수 있게 알려준다(기존 클라는 무시해도 무해).
  return NextResponse.json({ ok: true, balance: result.balance, alreadyUnlocked: result.status === "already" });
}