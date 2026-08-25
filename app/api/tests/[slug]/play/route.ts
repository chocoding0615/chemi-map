import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { TESTS } from "@/lib/content/tests";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";

// 결과가 나올 때마다 플레이 수와 유형별 분포를 센다.
// 정밀 통계가 아니라 "전국민 몇 %가 같은 유형" 재미용 지표라, 원자성보다 저렴한
// increment로 충분하다. 다만 다중 클릭·매크로는 IP 레이트리밋으로 느슨하게 막는다.
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = TESTS[slug];
  if (!def) return NextResponse.json({ error: "없는 테스트예요." }, { status: 404 });

  const rateLimit = await checkRateLimit(getClientIp(request.headers), RATE_LIMITS.testPlays);
  if (!rateLimit.ok) {
    return NextResponse.json({ error: "잠시 후에 시도해주세요." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const resultTypeId = typeof body?.resultTypeId === "string" ? body.resultTypeId : "";
  if (!def.results.some((r) => r.id === resultTypeId)) {
    return NextResponse.json({ error: "결과 유형이 올바르지 않아요." }, { status: 400 });
  }

  await getDb()
    .collection("tests")
    .doc(def.slug)
    .set(
      {
        title: def.title,
        plays: FieldValue.increment(1),
        lastPlayedAt: FieldValue.serverTimestamp(),
        [`results.${resultTypeId}`]: FieldValue.increment(1),
      },
      { merge: true }
    );

  return new NextResponse(null, { status: 204 });
}
