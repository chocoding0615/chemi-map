import Link from "next/link";
import NavControls from "./NavControls";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

// 관리자는 /my까지 들어가지 않아도 어느 화면에서든 바로 관리자 페이지로 넘어갈 수
// 있어야 해서, 헤더 자체에서 세션/관리자 여부를 확인한다. 매 페이지 로드마다
// Firestore 조회가 하나 더 붙지만(로그인 상태일 때만), 다른 페이지들도 이미
// getSession()을 개별로 부르고 있어서 새로운 비용 패턴은 아니다.
export default async function AppHeader() {
  const session = await getSession();
  const admin = session ? await isAdmin(session.uid) : false;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-cream/90 px-4 py-2 backdrop-blur">
      <Link href="/" className="flex items-center gap-1.5 text-sm font-extrabold text-brown">
        🦊 여우점
      </Link>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">BETA</span>
        {admin && (
          <Link
            href="/admin"
            className="rounded-full bg-brown px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white transition active:scale-95 hover:bg-brown/90"
          >
            🛠️ 관리자
          </Link>
        )}
        <NavControls />
      </div>
    </header>
  );
}
