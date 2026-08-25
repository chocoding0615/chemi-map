import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// 관리자/테스터 계정에 관리자가 직접 잔디를 지급한다(테스트용). 일반 결제/무료충전과
// 다른 경로라 activity 로그(구매 내역)에는 안 남기고 잔액만 바로 올린다.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.uid))) {
    return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const targetUid = typeof body?.targetUid === "string" ? body.targetUid : "";
  const amount = typeof body?.amount === "number" ? Math.trunc(body.amount) : NaN;
  if (!targetUid || !Number.isFinite(amount) || amount <= 0 || amount > 100000) {
    return NextResponse.json({ error: "targetUid와 1~100000 사이의 amount가 필요합니다." }, { status: 400 });
  }

  const userRef = getDb().collection("users").doc(targetUid);
  const snap = await userRef.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "존재하지 않는 계정이에요." }, { status: 404 });
  }

  await userRef.update({ ticketBalance: FieldValue.increment(amount) });
  return NextResponse.json({ ok: true });
}
