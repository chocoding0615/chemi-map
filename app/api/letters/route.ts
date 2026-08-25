import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { countLetters, MAX_LETTERS_PER_INBOX } from "@/lib/letters";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  // 비로그인 공개 엔드포인트라 편지함 스팸/꽉 채우기를 IP 단위로 제한한다.
  const rateLimit = await checkRateLimit(getClientIp(request.headers), RATE_LIMITS.letters);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "편지를 너무 많이 보냈어요. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 3600) } }
    );
  }

  const body = await request.json().catch(() => null);
  const handle = typeof body?.handle === "string" ? body.handle.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const senderNameRaw = typeof body?.senderName === "string" ? body.senderName.trim() : "";
  const senderName = senderNameRaw ? senderNameRaw.slice(0, 20) : "익명의 여우";

  if (!handle) {
    return NextResponse.json({ error: "잘못된 링크예요." }, { status: 400 });
  }
  if (!content || content.length > 50) {
    return NextResponse.json({ error: "편지 내용을 1~50자로 입력해주세요." }, { status: 400 });
  }

  const db = getDb();
  const handleSnap = await db.collection("handles").doc(handle).get();
  if (!handleSnap.exists) {
    return NextResponse.json({ error: "존재하지 않는 편지함이에요." }, { status: 404 });
  }
  const { uid: toUid } = handleSnap.data() as { uid: string };

  const currentCount = await countLetters(toUid);
  if (currentCount >= MAX_LETTERS_PER_INBOX) {
    return NextResponse.json({ error: "편지함이 가득 찼어요. 나중에 다시 보내주세요." }, { status: 400 });
  }

  await db.collection("users").doc(toUid).collection("letters").add({
    senderName,
    content,
    createdAt: FieldValue.serverTimestamp(),
    unlockedAt: null,
  });

  return new NextResponse(null, { status: 204 });
}
