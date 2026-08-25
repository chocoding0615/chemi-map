import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin, isEnvAdmin } from "@/lib/admin";
import { getDb } from "@/lib/firebaseAdmin";

type Role = "user" | "tester" | "admin";
const ROLES: Role[] = ["user", "tester", "admin"];

// "테스터"는 접근권한이 따로 없는 순수 라벨이다 - isAdmin()에 전혀 관여하지 않고,
// 관리자가 잔디를 편하게 챙겨줄 대상을 표시해두는 용도일 뿐이다.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !(await isAdmin(session.uid))) {
    return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const targetUid = typeof body?.targetUid === "string" ? body.targetUid : "";
  const role = ROLES.includes(body?.role) ? (body.role as Role) : null;
  if (!targetUid || !role) {
    return NextResponse.json({ error: "targetUid와 role이 필요합니다." }, { status: 400 });
  }

  // ADMIN_UIDS(환경변수)로 지정된 계정은 Firestore 플래그와 무관하게 항상 관리자라,
  // 여기서 관리자 밖으로 바꿔봤자 아무 효과가 없다는 걸 미리 알려준다.
  if (isEnvAdmin(targetUid) && role !== "admin") {
    return NextResponse.json(
      { error: "이 계정은 서버 설정(ADMIN_UIDS)으로 지정된 관리자라 여기서 바꿀 수 없어요." },
      { status: 400 }
    );
  }

  await getDb()
    .collection("users")
    .doc(targetUid)
    .update({ isAdmin: role === "admin", isTester: role === "tester" });
  return NextResponse.json({ ok: true });
}
