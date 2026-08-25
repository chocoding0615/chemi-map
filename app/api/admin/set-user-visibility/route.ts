import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { getDb } from "@/lib/firebaseAdmin";

// "삭제"는 계정을 실제로 지우는 게 아니라 관리자 목록 화면에서만 숨기는 것 -
// 유저 데이터(닉네임/잔디/활동기록)는 그대로 남고 언제든 복원할 수 있다.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.uid))) {
    return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const targetUid = typeof body?.targetUid === "string" ? body.targetUid : "";
  const hidden = body?.hidden === true;
  if (!targetUid) {
    return NextResponse.json({ error: "targetUid가 필요합니다." }, { status: 400 });
  }

  await getDb().collection("users").doc(targetUid).update({ hiddenInAdminList: hidden });
  return NextResponse.json({ ok: true });
}
