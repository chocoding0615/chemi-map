import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/firebaseAdmin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const letterSnap = await getDb().collection("users").doc(session.uid).collection("letters").doc(id).get();
  if (!letterSnap.exists) return NextResponse.json({ error: "편지를 찾을 수 없어요." }, { status: 404 });

  const letter = letterSnap.data() as {
    content: string;
    senderName: string;
    unlockedAt: unknown;
    createdAt?: { toDate: () => Date };
  };
  if (!letter.unlockedAt) {
    return NextResponse.json({ error: "아직 열람하지 않은 편지예요." }, { status: 403 });
  }

  return NextResponse.json({
    content: letter.content,
    senderName: letter.senderName,
    createdAt: (letter.createdAt?.toDate() ?? new Date()).toISOString(),
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  await getDb().collection("users").doc(session.uid).collection("letters").doc(id).delete();
  return new NextResponse(null, { status: 204 });
}
