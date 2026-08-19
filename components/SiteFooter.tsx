import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto w-full px-6 py-8 text-center">
      <div className="mx-auto flex max-w-[480px] flex-col items-center gap-2 text-[11px] leading-relaxed text-brown-soft/50">
        <p>
          여우점 (베타 서비스) · 사업자 등록 준비 중 · 통신판매업 신고 예정 · 고객센터: 준비 중
        </p>
        <p>본 서비스의 모든 결제는 테스트(mock) 결제이며 실제로 청구되지 않아요.</p>
        <p>제3자의 유사 서비스와는 무관해요.</p>
        <div className="mt-1 flex items-center gap-3">
          <Link href="/terms" className="underline underline-offset-2 hover:text-brown-soft/80">
            이용약관
          </Link>
          <Link href="/privacy" className="underline underline-offset-2 hover:text-brown-soft/80">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
