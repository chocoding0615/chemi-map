import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { MBTI_TYPES, mbtiToTemperament } from "@/lib/result-engine/temperament";
import { computeResult } from "@/lib/result-engine/compute";
import { getNextOpenSlot, type EquipmentSlot } from "@/lib/result-engine/equipment";
import { FieldValue } from "firebase-admin/firestore";

const BIRTHDATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BIRTHTIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const mbti = typeof body?.mbti === "string" ? body.mbti.toUpperCase() : "";
  const birthdate = typeof body?.birthdate === "string" ? body.birthdate : "";
  const birthTime = typeof body?.birthTime === "string" && body.birthTime ? body.birthTime : undefined;

  if (!name || name.length > 20) {
    return NextResponse.json({ error: "이름을 1~20자로 입력해주세요." }, { status: 400 });
  }
  if (!MBTI_TYPES.includes(mbti as (typeof MBTI_TYPES)[number])) {
    return NextResponse.json({ error: "MBTI 값이 올바르지 않습니다." }, { status: 400 });
  }
  if (!BIRTHDATE_RE.test(birthdate)) {
    return NextResponse.json({ error: "생년월일 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (birthTime && !BIRTHTIME_RE.test(birthTime)) {
    return NextResponse.json({ error: "출생 시간 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const year = Number(birthdate.slice(0, 4));
  if (year < 1930 || year > new Date().getFullYear()) {
    return NextResponse.json({ error: "생년월일을 다시 확인해주세요." }, { status: 400 });
  }

  const mapRef = getDb().collection("maps").doc(slug);
  const mapSnap = await mapRef.get();
  if (!mapSnap.exists) {
    return NextResponse.json({ error: "존재하지 않는 지도입니다." }, { status: 404 });
  }
  const mapData = mapSnap.data()!;

  const result = computeResult({
    ownerName: mapData.ownerName,
    ownerMbti: mapData.ownerMbti,
    ownerElement: mapData.ownerElement,
    visitorName: name,
    visitorMbti: mbti,
    visitorBirthdate: birthdate,
    visitorBirthTime: birthTime,
  });

  // 슬롯은 "먼저 등록한 사람 순"으로 딱 한 번만 정해서 저장한다 — 나중에 케미
  // 점수가 더 높은 사람이 와도 이미 배정된 사람의 슬롯은 바뀌지 않는다.
  const existingEntriesSnap = await mapRef.collection("entries").get();
  const takenSlots = existingEntriesSnap.docs
    .map((doc) => doc.data().equipmentSlot as EquipmentSlot | null)
    .filter((slot): slot is EquipmentSlot => slot !== null);
  const equipmentSlot = getNextOpenSlot(takenSlots);

  const now = FieldValue.serverTimestamp();
  const entryRef = await mapRef.collection("entries").add({
    visitorName: name,
    visitorMbti: mbti,
    visitorBirthdate: birthdate,
    visitorBirthTime: birthTime ?? null,
    visitorElement: result.visitorElement,
    visitorElementDistribution: result.distribution,
    visitorHasTimeInput: result.hasTimeInput,
    visitorTemperament: mbtiToTemperament(mbti),
    affinityCategory: result.affinityCategory,
    affinityScore: result.affinityScore,
    equipmentSlot,
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
