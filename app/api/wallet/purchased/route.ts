import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { hasPurchased } from "@/lib/wallet";
import { getProductPriceKrw } from "@/lib/pricing";

// productId가 카탈로그(lib/pricing.ts)에 없는 값이면 category/title도 신뢰하지 않고
// 바로 미구매 처리한다 — 이 엔드포인트는 결제를 하지 않으니 값을 조작해도 자기 자신의
// 구매 이력 조회 결과만 바뀔 뿐이지만, 그래도 유효한 상품에 대해서만 응답한다.
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ purchased: false });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") ?? "";
  const category = searchParams.get("category")?.slice(0, 50) ?? "";
  const title = searchParams.get("title")?.slice(0, 100) ?? "";

  if (getProductPriceKrw(productId) === null || !category || !title) {
    return NextResponse.json({ purchased: false });
  }

  const purchased = await hasPurchased(session.uid, category, title);
  return NextResponse.json({ purchased });
}
