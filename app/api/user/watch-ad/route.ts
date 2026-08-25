import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// 마이페이지 무료충전을 없애면서 생긴 유일한 무료 잔디 경로. 실제 광고 SDK가 아직
// 없어서(lib/ads.ts) 남용 방지용으로 하루 한도를 걸어둔다 - 날짜는 KST 보정 없이
// UTC 기준(다른 곳의 dailyStreak 로직과 동일한 규칙)이라 자정 근처엔 하루가 살짝
// 일찍 넘어갈 수 있지만, 보상 성격상 크게 문제되지 않는다.
const DAILY_LIMIT = 3;
const REWARD_AMOUNT = 1;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const snap = await getDb().collection("users").doc(session.uid).get();
  const data = snap.data() as { adRewardDate?: string; adRewardCount?: number } | undefined;
  const count = data?.adRewardDate === todayKey() ? (data.adRewardCount ?? 0) : 0;
  return NextResponse.json({ remaining: Math.max(0, DAILY_LIMIT - count), limit: DAILY_LIMIT });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const userRef = getDb().collection("users").doc(session.uid);
  const today = todayKey();

  const result = await getDb().runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.data() as { adRewardDate?: string; adRewardCount?: number } | undefined;
    const count = data?.adRewardDate === today ? (data?.adRewardCount ?? 0) : 0;
    if (count >= DAILY_LIMIT) {
      return { ok: false as const };
    }
    tx.update(userRef, {
      ticketBalance: FieldValue.increment(REWARD_AMOUNT),
      adRewardDate: today,
      adRewardCount: count + 1,
    });
    return { ok: true as const, remaining: DAILY_LIMIT - (count + 1) };
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "오늘 받을 수 있는 광고 보상을 다 받았어요. 내일 다시 와주세요.", remaining: 0 },
      { status: 429 }
    );
  }
  return NextResponse.json({ ok: true, remaining: result.remaining, reward: REWARD_AMOUNT });
}
