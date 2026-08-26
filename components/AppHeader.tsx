import Link from "next/link";
import NavControls from "./NavControls";
import AdminBadge from "./AdminBadge";

// 관리자는 /my까지 들어가지 않아도 어느 화면에서든 바로 관리자 페이지로 넘어갈 수
// 있어야 하지만, 그 확인(getSession/isAdmin)을 여기서 서버 컴포넌트로 직접 하면
// cookies() 호출 때문에 이 헤더를 쓰는 모든 페이지가 정적 생성에서 빠져버린다
// (/saju, /fortune/*, /test 등 전부 매 요청 서버 렌더링을 타게 됨 - 실제로 그렇게
// 됐던 걸 되돌린 이력이 있다). 그래서 관리자 배지만 AdminBadge(클라이언트)로 분리해
// 지갑 잔액 표시와 같은 패턴으로 하이드레이션 후에 따로 붙인다.
export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-cream/90 px-4 py-2 backdrop-blur">
      <Link href="/" className="flex items-center gap-1.5 text-sm font-extrabold text-brown">
        🦊 여우점
      </Link>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">BETA</span>
        <AdminBadge />
        <NavControls />
      </div>
    </header>
  );
}
