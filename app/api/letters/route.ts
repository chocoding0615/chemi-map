import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const handle = typeof body?.handle === "string" ? body.handle.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const senderNameRaw = typeof body?.senderName === "string" ? body.senderName.trim() : "";
  const senderName = senderNameRaw ? senderNameRaw.slice(0, 20) : "익명의 여우";

  if (!handle) {
    return NextResponse.json({ error: "잘못된 링크예요." }, { status: 400 });
  }
  if (!content || content.length > 300) {
    return NextResponse.json({ error: "편지 내용을 1~300자로 입력해주세요." }, { status: 400 });
  }

  const db = getDb();
  const handleSnap = await db.collection("handles").doc(handle).get();
  if (!handleSnap.exists) {
    return NextResponse.json({ error: "존재하지 않는 편지함이에요." }, { status: 404 });
  }
  const { uid: toUid } = handleSnap.data() as { uid: string };

  await db.collection("users").doc(toUid).collection("letters").add({
    senderName,
    content,
    createdAt: FieldValue.serverTimestamp(),
    unlockedAt: null,
  });

  return new NextResponse(null, { status: 204 });
}
