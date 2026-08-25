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
  const senderName = senderNameRaw ? senderNameRaw.slice(0, 20) : "?듬챸???ъ슦";

  if (!handle) {
    return NextResponse.json({ error: "?섎せ??留곹겕?덉슂." }, { status: 400 });
  }
  if (!content || content.length > 50) {
    return NextResponse.json({ error: "?몄? ?댁슜??1~50?먮줈 ?낅젰?댁＜?몄슂." }, { status: 400 });
  }

  const db = getDb();
  const handleSnap = await db.collection("handles").doc(handle).get();
  if (!handleSnap.exists) {
    return NextResponse.json({ error: "議댁옱?섏? ?딅뒗 ?몄??⑥씠?먯슂." }, { status: 404 });
  }
  const { uid: toUid } = handleSnap.data() as { uid: string };

  const currentCount = await countLetters(toUid);
  if (currentCount >= MAX_LETTERS_PER_INBOX) {
    return NextResponse.json({ error: "?몄??⑥씠 媛??李쇱뼱?? ?섏쨷???ㅼ떆 蹂대궡二쇱꽭??" }, { status: 400 });
  }

  await db.collection("users").doc(toUid).collection("letters").add({
    senderName,
    content,
    createdAt: FieldValue.serverTimestamp(),
    unlockedAt: null,
  });

  return new NextResponse(null, { status: 204 });
}
