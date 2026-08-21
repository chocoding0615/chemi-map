export const metadata = { title: "개인정보처리방침 · 여우점" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-[480px] flex-1 px-6 py-16">
      <h1 className="text-xl font-extrabold text-brown">개인정보처리방침</h1>
      <p className="mt-4 rounded-2xl bg-white p-5 text-sm leading-relaxed text-brown-soft shadow-sm ring-1 ring-brown/5">
        개인정보처리방침을 준비하고 있어요. 카카오·네이버 로그인 시 닉네임·프로필 사진만
        받아오고, 마이페이지의 활동 기록·잔디 잔액·받은 비밀편지는 로그인한 계정 기준으로
        서버(Firestore)에 저장돼요. 여우 마을의 &ldquo;진짜 인연 매칭&rdquo;·사주 풀이에
        입력한 이름·생년월일 등도 결과 계산과 지도 표시를 위해 서버(Firestore)에 저장돼요.
        여우 마을 화면 자체(집·나무 등 자리 잠금 해제)는 로그인과 무관하게 이 브라우저에만
        남아요. &ldquo;AI 상세 사주 리포트&rdquo;를 이용하면 입력한 생년월일시·성별·MBTI가
        AI 분석을 위해 제3자 AI 서비스(OpenRouter)로 전송돼요 — 이 정보는 리포트 생성
        목적으로만 쓰이고, 광고나 다른 목적으로는 쓰이지 않아요. 정식 방침은 사업자 등록
        이후 이 페이지에 게시할 예정이에요.
      </p>
    </div>
  );
}
