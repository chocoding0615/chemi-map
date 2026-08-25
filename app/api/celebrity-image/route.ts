import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { CELEBRITY_BANK, type CelebrityEntry } from "@/lib/content/celebrities";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";

const ALL_CELEBRITIES: Record<string, CelebrityEntry> = Object.fromEntries(
  Object.values(CELEBRITY_BANK)
    .flat()
    .map((c) => [c.id, c])
);

interface CelebrityImage {
  imageUrl: string;
  sourcePageUrl: string;
}

interface WikiSummary {
  thumbnail?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
}

// 위키피디아 REST API에서 인물 썸네일을 가져온다. 이미지 바이트 자체는 우리 서버에
// 복사하지 않고(초상권 리스크), 위키가 제공하는 이미지 URL 문자열만 캐시해서
// 재요청 시 위키피디아를 다시 호출하지 않게 한다.
async function fetchFromWikipedia(entry: CelebrityEntry): Promise<CelebrityImage | null> {
  const url = `https://${entry.wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(entry.wikiTitle)}`;
  const res = await fetch(url, { headers: { "User-Agent": "yeojujeom-app (chemi-map)" } });
  if (!res.ok) return null;
  const data = (await res.json()) as WikiSummary;
  const imageUrl = data.thumbnail?.source;
  const sourcePageUrl = data.content_urls?.desktop?.page;
  if (!imageUrl || !sourcePageUrl) return null;
  return { imageUrl, sourcePageUrl };
}

async function getCelebrityImage(id: string): Promise<CelebrityImage | null> {
  const entry = ALL_CELEBRITIES[id];
  if (!entry) return null;

  const docRef = getDb().collection("celebrityImages").doc(id);
  const cached = await docRef.get();
  if (cached.exists) {
    const data = cached.data() as CelebrityImage;
    return { imageUrl: data.imageUrl, sourcePageUrl: data.sourcePageUrl };
  }

  const fetched = await fetchFromWikipedia(entry);
  if (!fetched) return null;

  await docRef.set({ ...fetched, cachedAt: FieldValue.serverTimestamp() });
  return fetched;
}

export async function GET(request: NextRequest) {
  const rateLimit = await checkRateLimit(getClientIp(request.headers), RATE_LIMITS.celebrityImage);
  if (!rateLimit.ok) {
    return NextResponse.json({ error: "잠시 후에 시도해주세요." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 10);
  if (ids.length === 0) return NextResponse.json({ error: "ids가 필요합니다." }, { status: 400 });

  const entries = await Promise.all(
    ids.map(async (id) => [id, await getCelebrityImage(id)] as const)
  );

  const images: Record<string, CelebrityImage> = {};
  for (const [id, image] of entries) {
    if (image) images[id] = image;
  }

  return NextResponse.json({ images });
}
