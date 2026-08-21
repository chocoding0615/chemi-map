import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return new NextResponse(null, { status: 204 });

  const body = await request.json().catch(() => null);
  const category = typeof body?.category === "string" ? body.category.slice(0, 50) : "";
  const title = typeof body?.title === "string" ? body.title.slice(0, 100) : "";
  const priceKrw = typeof body?.priceKrw === "number" && Number.isFinite(body.priceKrw) ? body.priceKrw : 0;

  if (!category || !title) {
    return NextResponse.json({ error: "category, title이 필요합니다." }, { status: 400 });
  }

  await getDb().collection("users").doc(session.uid).collection("activity").add({
    category,
    title,
    priceKrw,
    unlockedAt: FieldValue.serverTimestamp(),
  });

  return new NextResponse(null, { status: 204 });
}
