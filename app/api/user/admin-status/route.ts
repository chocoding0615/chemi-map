import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ isAdmin: false });
  return NextResponse.json({ isAdmin: await isAdmin(session.uid) });
}
