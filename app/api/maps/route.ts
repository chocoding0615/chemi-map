import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { generateUniqueSlug } from "@/lib/slug";
import { MBTI_TYPES, mbtiToTemperament } from "@/lib/result-engine/temperament";
import { calculateElementProfile } from "@/lib/result-engine/elements";
import { FieldValue } from "firebase-admin/firestore";

const BIRTHDATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BIRTHTIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const gender = body?.gender === "male" || body?.gender === "female" ? body.gender : "";
  const mbti = typeof body?.mbti === "string" ? body.mbti.toUpperCase() : "";
  const birthdate = typeof body?.birthdate === "string" ? body.birthdate : "";
  const isLunar = body?.isLunar === true;
  const birthTime = typeof body?.birthTime === "string" && body.birthTime ? body.birthTime : undefined;

  if (!name || name.length > 20) {
    return NextResponse.json({ error: "이름을 1~20자로 입력해주세요." }, { status: 400 });
  }
  if (!gender) {
    return NextResponse.json({ error: "성별을 선택해주세요." }, { status: 400 });
  }
  if (mbti && !MBTI_TYPES.includes(mbti as (typeof MBTI_TYPES)[number])) {
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

  const slug = await generateUniqueSlug();
  const now = FieldValue.serverTimestamp();
  const profile = calculateElementProfile(birthdate, birthTime, { isLunar: isLunar || undefined });

  await getDb()
    .collection("maps")
    .doc(slug)
    .set({
      slug,
      ownerName: name,
      ownerGender: gender,
      ownerMbti: mbti,
      ownerBirthdate: birthdate,
      ownerIsLunar: isLunar,
      ownerBirthTime: birthTime ?? null,
      ownerElement: profile.dominant,
      ownerElementDistribution: profile.distribution,
      ownerHasTimeInput: profile.hasTimeInput,
      ownerTemperament: mbtiToTemperament(mbti),
      entryCount: 0,
      createdAt: now,
      updatedAt: now,
    });

  return NextResponse.json({ slug });
}
