import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { updateProfile, deleteProfile, parseProfileInput } from "@/lib/profiles";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const input = parseProfileInput(body);
  if (!input) return NextResponse.json({ error: "이름·생년월일·성별을 확인해주세요." }, { status: 400 });

  await updateProfile(session.uid, id, input);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  await deleteProfile(session.uid, id);
  return NextResponse.json({ ok: true });
}
