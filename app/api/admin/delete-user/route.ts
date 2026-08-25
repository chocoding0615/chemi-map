import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin, isEnvAdmin } from "@/lib/admin";
import { getDb } from "@/lib/firebaseAdmin";

// 되돌릴 수 없는 진짜 삭제 - "숨긴 유저" 목록 안에서만 노출되는 2차 확인용 동작이다.
// users/{uid} 문서와 그 아래 서브컬렉션(activity, sajuLlmReports, profiles 등) 전체를
// recursiveDelete로 지운다. 단, letterHandle.ts가 최상위 handles/{handle}에 만들어둔
// 역방향 매핑은 users 서브트리 밖이라 여기서 같이 지워지지 않는다 - 그 핸들은
// 이후 누구에게도 재발급되지 않고 죽은 채로 남는다(별 문제는 아니라 이번엔 손대지 않음).
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.uid))) {
    return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const targetUid = typeof body?.targetUid === "string" ? body.targetUid : "";
  if (!targetUid) {
    return NextResponse.json({ error: "targetUid가 필요합니다." }, { status: 400 });
  }
  if (targetUid === session.uid) {
    return NextResponse.json({ error: "본인 계정은 여기서 삭제할 수 없어요." }, { status: 400 });
  }
  if (isEnvAdmin(targetUid)) {
    return NextResponse.json(
      { error: "이 계정은 서버 설정(ADMIN_UIDS)으로 지정된 관리자라 삭제할 수 없어요." },
      { status: 400 }
    );
  }

  const db = getDb();
  await db.recursiveDelete(db.collection("users").doc(targetUid));
  return NextResponse.json({ ok: true });
}
