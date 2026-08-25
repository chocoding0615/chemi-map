import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { refundWallet } from "@/lib/wallet";
import { callLLM } from "@/lib/llm";
import { FORTUNE_CATEGORIES, type CategorySlug } from "@/lib/content/fortuneCategories";
import {
  getCategorySystemPrompt,
  buildCategoryUserMessage,
  isCategoryReadingSupported,
  type FortunePersonInput,
  type PairInfo,
} from "@/lib/result-engine/fortunePrompt";
import {
  reserveReadingSlot,
  abandonReadingReservation,
  saveFortuneReading,
  makeReadingId,
  DAILY_READING_LIMIT,
} from "@/lib/fortuneReading";
import { MBTI_TYPES } from "@/lib/result-engine/temperament";

// 운세 카테고리별 특화 AI 리딩. 사주 AI리포트(/api/saju/llm-report)와 동일한
// [캐시 -> 원자적 선차감 -> LLM 호출 -> 저장, 실패시 환불] 구조를 따른다.

function parsePerson(raw: unknown): FortunePersonInput | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const birthdate = typeof b.birthdate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.birthdate) ? b.birthdate : null;
  const gender = b.gender === "male" || b.gender === "female" ? (b.gender as "male" | "female") : null;
  if (!birthdate || !gender) return null;

  const birthTime = typeof b.birthTime === "string" && /^\d{2}:\d{2}$/.test(b.birthTime) ? b.birthTime : undefined;
  const mbti =
    typeof b.mbti === "string" && MBTI_TYPES.includes(b.mbti as (typeof MBTI_TYPES)[number]) ? b.mbti : undefined;
  const name = typeof b.name === "string" && b.name.trim() ? b.name.trim().slice(0, 20) : undefined;

  return { birthdate, gender, birthTime, mbti, name };
}

function parsePairInfo(raw: unknown): PairInfo | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const score = typeof b.score === "number" && Number.isFinite(b.score) ? Math.round(b.score) : null;
  if (score === null || score < 0 || score > 100) return null;
  const label = typeof b.label === "string" && b.label.trim() ? b.label.trim().slice(0, 20) : "";
  const emoji = typeof b.emoji === "string" && b.emoji.trim() ? Array.from(b.emoji.trim())[0] : "";
  const mbtiLabel = typeof b.mbtiLabel === "string" && b.mbtiLabel.trim() ? b.mbtiLabel.trim().slice(0, 30) : undefined;
  return { score, label, emoji, mbtiLabel };
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { slug: rawSlug } = await ctx.params;
  if (!isCategoryReadingSupported(rawSlug)) {
    return NextResponse.json({ error: "알 수 없는 운세 종류예요." }, { status: 404 });
  }
  const slug = rawSlug as CategorySlug;
  const category = FORTUNE_CATEGORIES[slug];

  const body = await request.json().catch(() => null);
  const me = parsePerson(body?.me);
  if (!me) return NextResponse.json({ error: "생년월일과 성별이 필요합니다." }, { status: 400 });

  let partner: FortunePersonInput | undefined;
  let pairInfo: PairInfo | undefined;
  if (category.inputKind === "twoBirthdates") {
    partner = parsePerson(body?.partner) ?? undefined;
    if (!partner) {
      return NextResponse.json({ error: "두 사람의 생년월일과 성별이 필요합니다." }, { status: 400 });
    }
    pairInfo = parsePairInfo(body?.pairInfo) ?? undefined;
  }

  const readingId = makeReadingId(slug, me, partner);
  const names = partner
    ? `${me.name?.trim() || "나"} / ${partner.name?.trim() || "상대"}`
    : me.name?.trim() || "나";
  const activity = {
    category: `${category.nameKo} 상세 리딩`,
    title: `${names}님의 ${category.nameKo} 상세 리딩`,
  };

  // 캐시 확인 -> 잔액 확인 -> 일일 한도 확인 -> 선차감을 트랜잭션 하나로 처리한다.
  // LLM 호출은 결제가 이미 확정된("reserved") 경우에만 일어난다.
  const reserved = await reserveReadingSlot(session.uid, readingId, category.priceKrw, DAILY_READING_LIMIT, activity);

  if (reserved.status === "cached") {
    return NextResponse.json({
      ok: true,
      readingText: reserved.readingText,
      readingId,
      cached: true,
      balance: session.ticketBalance,
    });
  }
  if (reserved.status === "inProgress") {
    return NextResponse.json({ error: "리딩을 만들고 있어요. 잠시 후 다시 시도해주세요." }, { status: 409 });
  }
  if (reserved.status === "insufficient") {
    return NextResponse.json({ ok: false, balance: reserved.balance, required: reserved.required }, { status: 402 });
  }
  if (reserved.status === "limit") {
    return NextResponse.json(
      { error: "오늘 생성 가능한 AI 리딩 횟수를 다 쓰셨어요. 내일 다시 시도해주세요." },
      { status: 429 }
    );
  }

  // status === "reserved" - 잔디는 이미 차감됐다. 아래 두 실패 경로 모두 반드시 환불한다.
  let readingText: string;
  try {
    readingText = await callLLM(
      [
        { role: "system", content: getCategorySystemPrompt(slug) },
        { role: "user", content: buildCategoryUserMessage(me, partner, pairInfo) },
      ],
      6000
    );
  } catch (err) {
    await refundWallet(session.uid, category.priceKrw, activity);
    await abandonReadingReservation(session.uid, readingId);
    const message = err instanceof Error ? err.message : "리딩 생성에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  try {
    await saveFortuneReading(session.uid, readingId, { slug, categoryKo: category.nameKo, names }, readingText);
  } catch {
    await refundWallet(session.uid, category.priceKrw, activity);
    await abandonReadingReservation(session.uid, readingId);
    return NextResponse.json({ error: "리딩 저장에 실패했어요. 다시 시도해주세요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, readingText, readingId, cached: false, balance: reserved.balance });
}
