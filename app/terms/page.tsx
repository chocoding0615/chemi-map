export const metadata = { title: "이용약관 · 여우점" };

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-[480px] flex-1 px-6 py-16">
      <h1 className="text-xl font-extrabold text-brown">이용약관</h1>
      <p className="mt-4 rounded-2xl bg-white p-5 text-sm leading-relaxed text-brown-soft shadow-sm ring-1 ring-brown/5">
        이용약관을 준비하고 있어요. 여우점은 아직 베타 서비스이고, 모든 결제는 실제 청구가
        발생하지 않는 테스트 결제예요. 정식 약관은 사업자 등록 이후 이 페이지에 게시할 예정이에요.
      </p>
    </div>
  );
}
