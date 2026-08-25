import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { chargeWallet } from "@/lib/wallet";
import { getProductPriceKrw } from "@/lib/pricing";

// 가격은 절대 클라이언트가 보낸 값을 믿지 않는다 — body의 priceKrw는 과거 호환용으로만
// 읽고 실제 차감에는 안 쓴다. productId로 서버가 lib/pricing.ts 카탈로그에서 다시 계산한
// 값만 사용해야 devtools로 가격을 조작해 콘텐츠를 무단으로 여는 걸 막을 수 있다.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const category = typeof body?.category === "string" ? body.category.slice(0, 50) : "";
  const title = typeof body?.title === "string" ? body.title.slice(0, 100) : "";
  const productId = typeof body?.productId === "string" ? body.productId : "";

  if (!category || !title || !productId) {
    return NextResponse.json({ error: "category, title, productId가 필요합니다." }, { status: 400 });
  }

  const priceKrw = getProductPriceKrw(productId);
  if (priceKrw === null) {
    return NextResponse.json({ error: "알 수 없는 상품이에요." }, { status: 400 });
  }

  const result = await chargeWallet(session.uid, priceKrw, { category, title });
  if (!result.ok) {
    return NextResponse.json({ ok: false, balance: result.balance, required: result.required }, { status: 402 });
  }
  return NextResponse.json({ ok: true, balance: result.balance });
}
