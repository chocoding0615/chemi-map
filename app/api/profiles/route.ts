import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listProfiles, createProfile, parseProfileInput } from "@/lib/profiles";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const profiles = await listProfiles(session.uid);
  return NextResponse.json({ profiles });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const input = parseProfileInput(body);
  if (!input) return NextResponse.json({ error: "이름·생년월일·성별을 확인해주세요." }, { status: 400 });

  const id = await createProfile(session.uid, input);
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
