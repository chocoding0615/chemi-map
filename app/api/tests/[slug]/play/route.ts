import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { TESTS, clampTestScore, resolveTestResult } from "@/lib/content/tests";
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
  const rawScore = typeof body?.score === "number" ? body.score : NaN;
  if (Number.isNaN(rawScore)) {
    return NextResponse.json({ error: "score가 필요합니다." }, { status: 400 });
  }
  // 결과 유형은 클라이언트가 보낸 값을 믿지 않고, 결과 페이지와 동일하게 점수로부터
  // 서버에서 직접 계산한다(신뢰 경계 + 결과 페이지와의 판정 불일치 방지).
  const score = clampTestScore(def, rawScore);
  const resultTypeId = resolveTestResult(def, score).id;

  // results를 점 표기 문자열 키("results.pro")로 넣으면 set({merge:true})가 이를 경로로
  // 풀어주지 않고 필드명 자체에 점이 들어간 채로 저장한다(점 경로 해석은 update()에서만
  // 동작함) - 중첩 객체로 넘겨야 results.{resultTypeId}에 실제로 병합된다.
  await getDb()
    .collection("tests")
    .doc(def.slug)
    .set(
      {
        title: def.title,
        plays: FieldValue.increment(1),
        lastPlayedAt: FieldValue.serverTimestamp(),
        results: { [resultTypeId]: FieldValue.increment(1) },
      },
      { merge: true }
    );

  return new NextResponse(null, { status: 204 });
}
