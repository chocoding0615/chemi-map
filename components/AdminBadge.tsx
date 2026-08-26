"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// 헤더에서 관리자 여부를 서버 컴포넌트로 직접 확인하면(getSession/isAdmin) 그
// cookies() 호출 때문에 이 헤더를 쓰는 모든 페이지가 정적 생성에서 제외돼
// 매 요청마다 서버 렌더링을 타게 된다(/saju, /fortune/*, /test 등 전부 포함).
// 지갑 잔액 표시(WalletPayButton 등)와 같은 패턴으로 클라이언트에서 따로
// fetch해서, 헤더 자체는 정적으로 남고 이 배지만 하이드레이션 후에 붙는다.
export default function AdminBadge() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/user/admin-status")
      .then((res) => res.json())
      .then((data: { isAdmin: boolean }) => setIsAdmin(data.isAdmin))
      .catch(() => {});
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="rounded-full bg-brown px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white transition active:scale-95 hover:bg-brown/90"
    >
      🛠️ 관리자
    </Link>
  );
}
