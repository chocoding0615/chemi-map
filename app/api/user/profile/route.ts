import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/firebaseAdmin";

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const nickname = typeof body?.nickname === "string" ? body.nickname.trim() : "";

  if (!nickname || nickname.length > 20) {
    return NextResponse.json({ error: "닉네임을 1~20자로 입력해주세요." }, { status: 400 });
  }

  await getDb().collection("users").doc(session.uid).update({ nickname });
  return NextResponse.json({ ok: true, nickname });
}
