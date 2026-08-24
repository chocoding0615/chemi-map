import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin, isEnvAdmin } from "@/lib/admin";
import { getDb } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.uid))) {
    return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const targetUid = typeof body?.targetUid === "string" ? body.targetUid : "";
  const nextIsAdmin = body?.isAdmin === true;
  if (!targetUid) {
    return NextResponse.json({ error: "targetUid가 필요합니다." }, { status: 400 });
  }

  // ADMIN_UIDS(환경변수)로 지정된 계정은 Firestore 플래그와 무관하게 항상 관리자라,
  // 여기서 껐다 켜봤자 아무 효과가 없다는 걸 미리 알려준다.
  if (isEnvAdmin(targetUid) && !nextIsAdmin) {
    return NextResponse.json(
      { error: "이 계정은 서버 설정(ADMIN_UIDS)으로 지정된 관리자라 여기서 해제할 수 없어요." },
      { status: 400 }
    );
  }

  await getDb().collection("users").doc(targetUid).update({ isAdmin: nextIsAdmin });
  return NextResponse.json({ ok: true });
}
