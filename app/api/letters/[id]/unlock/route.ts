import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/firebaseAdmin";
import { hasUnlockedAnyLetter, LETTER_UNLOCK_PRICE_KRW } from "@/lib/letters";
import { chargeWallet } from "@/lib/wallet";
import { FieldValue } from "firebase-admin/firestore";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  const letterRef = db.collection("users").doc(session.uid).collection("letters").doc(id);
  const letterSnap = await letterRef.get();
  if (!letterSnap.exists) return NextResponse.json({ error: "편지를 찾을 수 없어요." }, { status: 404 });

  const letter = letterSnap.data() as { senderName: string };
  const priceKrw = (await hasUnlockedAnyLetter(session.uid)) ? LETTER_UNLOCK_PRICE_KRW : 0;

  const result = await chargeWallet(session.uid, priceKrw, {
    category: "비밀 편지",
    title: `${letter.senderName}님이 보낸 편지`,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, balance: result.balance, required: result.required }, { status: 402 });
  }

  await letterRef.update({ unlockedAt: FieldValue.serverTimestamp() });

  return NextResponse.json({ ok: true, balance: result.balance });
}
