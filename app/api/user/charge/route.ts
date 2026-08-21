import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const CHARGE_AMOUNT_KRW = 1000;

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  await getDb()
    .collection("users")
    .doc(session.uid)
    .update({ ticketBalance: FieldValue.increment(CHARGE_AMOUNT_KRW) });

  return new NextResponse(null, { status: 204 });
}
