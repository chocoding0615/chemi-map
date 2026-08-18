import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { generateUniqueSlug } from "@/lib/slug";
import { MBTI_TYPES, mbtiToTemperament } from "@/lib/result-engine/temperament";
import { elementFromBirthdate } from "@/lib/result-engine/elements";
import { FieldValue } from "firebase-admin/firestore";

const BIRTHDATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const mbti = typeof body?.mbti === "string" ? body.mbti.toUpperCase() : "";
  const birthdate = typeof body?.birthdate === "string" ? body.birthdate : "";

  if (!name || name.length > 20) {
    return NextResponse.json({ error: "이름을 1~20자로 입력해주세요." }, { status: 400 });
  }
  if (!MBTI_TYPES.includes(mbti as (typeof MBTI_TYPES)[number])) {
    return NextResponse.json({ error: "MBTI 값이 올바르지 않습니다." }, { status: 400 });
  }
  if (!BIRTHDATE_RE.test(birthdate)) {
    return NextResponse.json({ error: "생년월일 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const year = Number(birthdate.slice(0, 4));
  if (year < 1930 || year > new Date().getFullYear()) {
    return NextResponse.json({ error: "생년월일을 다시 확인해주세요." }, { status: 400 });
  }

  const slug = await generateUniqueSlug();
  const now = FieldValue.serverTimestamp();

  await getDb()
    .collection("maps")
    .doc(slug)
    .set({
      slug,
      ownerName: name,
      ownerMbti: mbti,
      ownerBirthdate: birthdate,
      ownerElement: elementFromBirthdate(birthdate),
      ownerTemperament: mbtiToTemperament(mbti),
      entryCount: 0,
      createdAt: now,
      updatedAt: now,
    });

  return NextResponse.json({ slug });
}
