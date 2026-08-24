import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getWalletTier } from "@/lib/walletTiers";

const DEFAULT_CHARGE_AMOUNT = 7;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

// 실제 결제 연동 전 임시 무료 충전. 무제한으로 두면 AI 리포트처럼 실비용이 나가는
// 기능을 공짜 잔디로 무한히 돌릴 수 있어(지인 테스트 단계에서도 위험), 계정당
// 24시간에 한 번으로 막아둔다. tierId를 주면 이용권 티어 수량(보너스 포함)만큼,
// 안 주면 이전과 동일하게 기본 수량만큼 충전한다.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tierId = typeof body?.tierId === "string" ? body.tierId : null;
  const tier = tierId ? getWalletTier(tierId) : null;
  if (tierId && !tier) {
    return NextResponse.json({ error: "존재하지 않는 이용권이에요." }, { status: 400 });
  }
  const chargeAmount = tier ? tier.jandi + tier.bonus : DEFAULT_CHARGE_AMOUNT;

  const userRef = getDb().collection("users").doc(session.uid);

  const result = await getDb().runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const lastChargedAt = snap.data()?.lastFreeChargeAt as Timestamp | undefined;
    const elapsed = lastChargedAt ? Date.now() - lastChargedAt.toMillis() : Infinity;
    if (elapsed < COOLDOWN_MS) {
      return { ok: false as const, retryAfterMs: COOLDOWN_MS - elapsed };
    }
    tx.update(userRef, {
      ticketBalance: FieldValue.increment(chargeAmount),
      lastFreeChargeAt: FieldValue.serverTimestamp(),
    });
    return { ok: true as const };
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "무료 충전은 24시간에 한 번만 가능해요.", retryAfterMs: result.retryAfterMs },
      { status: 429 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
