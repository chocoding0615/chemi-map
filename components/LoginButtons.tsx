export default function LoginButtons() {
  return (
    <div className="mt-6 w-full space-y-2.5">
      <a
        href="/api/auth/kakao/login"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3 text-sm font-bold text-[#181600] transition active:scale-95"
      >
        카카오로 시작하기
      </a>
      <a
        href="/api/auth/naver/login"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#03C75A] py-3 text-sm font-bold text-white transition active:scale-95"
      >
        네이버로 시작하기
      </a>
    </div>
  );
}
