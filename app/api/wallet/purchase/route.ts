import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { chargeWallet } from "@/lib/wallet";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const category = typeof body?.category === "string" ? body.category.slice(0, 50) : "";
  const title = typeof body?.title === "string" ? body.title.slice(0, 100) : "";
  const priceKrw = typeof body?.priceKrw === "number" && Number.isFinite(body.priceKrw) && body.priceKrw >= 0 ? body.priceKrw : NaN;

  if (!category || !title || Number.isNaN(priceKrw)) {
    return NextResponse.json({ error: "category, title, priceKrw가 필요합니다." }, { status: 400 });
  }

  const result = await chargeWallet(session.uid, priceKrw, { category, title });
  if (!result.ok) {
    return NextResponse.json({ ok: false, balance: result.balance, required: result.required }, { status: 402 });
  }
  return NextResponse.json({ ok: true, balance: result.balance });
}
