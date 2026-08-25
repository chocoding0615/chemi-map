import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { MBTI_TYPES, mbtiToTemperament } from "@/lib/result-engine/temperament";
import { computeResult } from "@/lib/result-engine/compute";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";

const BIRTHDATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BIRTHTIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  // 비로그인 공개 엔드포인트라 방명록 스팸을 IP 단위로 제한한다.
  const rateLimit = await checkRateLimit(getClientIp(request.headers), RATE_LIMITS.mapEntries);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "요청이 너무 많아요. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 3600) } }
    );
  }
  const { slug } = await params;
  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const mbti = typeof body?.mbti === "string" ? body.mbti.toUpperCase() : "";
  const birthdate = typeof body?.birthdate === "string" ? body.birthdate : "";
  const isLunar = body?.isLunar === true;
  const birthTime = typeof body?.birthTime === "string" && body.birthTime ? body.birthTime : undefined;

  if (!name || name.length > 20) {
    return NextResponse.json({ error: "?대쫫??1~20?먮줈 ?낅젰?댁＜?몄슂." }, { status: 400 });
  }
  if (mbti && !MBTI_TYPES.includes(mbti as (typeof MBTI_TYPES)[number])) {
    return NextResponse.json({ error: "MBTI 媛믪씠 ?щ컮瑜댁? ?딆뒿?덈떎." }, { status: 400 });
  }
  if (!BIRTHDATE_RE.test(birthdate)) {
    return NextResponse.json({ error: "?앸뀈?붿씪 ?뺤떇???щ컮瑜댁? ?딆뒿?덈떎." }, { status: 400 });
  }
  if (birthTime && !BIRTHTIME_RE.test(birthTime)) {
    return NextResponse.json({ error: "異쒖깮 ?쒓컙 ?뺤떇???щ컮瑜댁? ?딆뒿?덈떎." }, { status: 400 });
  }
  const year = Number(birthdate.slice(0, 4));
  if (year < 1930 || year > new Date().getFullYear()) {
    return NextResponse.json({ error: "?앸뀈?붿씪???ㅼ떆 ?뺤씤?댁＜?몄슂." }, { status: 400 });
  }

  const mapRef = getDb().collection("maps").doc(slug);
  const mapSnap = await mapRef.get();
  if (!mapSnap.exists) {
    return NextResponse.json({ error: "議댁옱?섏? ?딅뒗 吏?꾩엯?덈떎." }, { status: 404 });
  }
  const mapData = mapSnap.data()!;

  const result = computeResult({
    ownerName: mapData.ownerName,
    ownerMbti: mapData.ownerMbti,
    ownerElement: mapData.ownerElement,
    visitorName: name,
    visitorMbti: mbti,
    visitorBirthdate: birthdate,
    visitorIsLunar: isLunar,
    visitorBirthTime: birthTime,
  });

  const now = FieldValue.serverTimestamp();
  const entryRef = await mapRef.collection("entries").add({
    visitorName: name,
    visitorMbti: mbti,
    visitorBirthdate: birthdate,
    visitorIsLunar: isLunar,
    visitorBirthTime: birthTime ?? null,
    visitorElement: result.visitorElement,
    visitorElementDistribution: result.distribution,
    visitorHasTimeInput: result.hasTimeInput,
    visitorTemperament: mbtiToTemperament(mbti),
    affinityCategory: result.affinityCategory,
    affinityScore: result.affinityScore,
    seasonType: result.seasonType,
    resultTitle: result.title,
    resultElementBlurb: result.elementBlurb,
    resultAffinityBlurb: result.affinityBlurb,
    resultDistributionBlurb: result.distributionBlurb,
    resultPillarText: result.pillarText,
    createdAt: now,
  });

  await mapRef.update({
    entryCount: FieldValue.increment(1),
    updatedAt: now,
  });

  return NextResponse.json({
    entryId: entryRef.id,
    result,
    ownerName: mapData.ownerName,
  });
}
