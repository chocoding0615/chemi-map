export const metadata = { title: "개인정보처리방침 · 여우점" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-[480px] flex-1 px-6 py-16">
      <h1 className="text-xl font-extrabold text-brown">개인정보처리방침</h1>
      <p className="mt-4 rounded-2xl bg-white p-5 text-sm leading-relaxed text-brown-soft/70 shadow-sm ring-1 ring-brown/5">
        개인정보처리방침을 준비하고 있어요. 마이페이지의 활동 기록·질문권 잔액은 이 기기의
        브라우저(localStorage)에만 저장되고 서버로 전송되지 않아요. 여우 마을의 &ldquo;진짜 인연
        매칭&rdquo;·사주 풀이에 입력한 이름·생년월일 등은 결과 계산과 지도 표시를 위해
        서버(Firestore)에 저장돼요. 여우 마을 화면 자체(집·나무 등 자리 잠금 해제)는
        이 저장과 무관하게 이 브라우저에만 남아요. 정식
        방침은 사업자 등록 이후 이 페이지에 게시할 예정이에요.
      </p>
    </div>
  );
}
