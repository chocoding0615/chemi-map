export const metadata = { title: "잔디 이용안내 · 여우점" };

export default function WalletPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-[480px] md:max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-xl font-extrabold text-brown">잔디 이용안내</h1>
      <p className="mt-1 text-xs text-brown-soft/40">유효기간 · 환불 규정</p>

      <div className="mt-4 space-y-4">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brown/5">
          <h2 className="text-sm font-bold text-coral-dark">🚧 지금은 베타예요</h2>
          <p className="mt-2 text-sm leading-relaxed text-brown-soft">
            여우점은 아직 사업자 등록 전 베타 서비스라, 잔디 충전에는 실제 결제가 발생하지 않아요. 지금 충전 버튼을
            누르면 테스트용으로 잔디가 바로 채워져요. 사업자 등록 이후 실제 결제로 전환되면, 이 페이지에 정식 약관과
            함께 다시 안내드릴게요.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brown/5">
          <h2 className="text-sm font-bold text-coral-dark">유효기간</h2>
          <p className="mt-2 text-sm leading-relaxed text-brown-soft">
            베타 기간 동안 충전한 잔디는 따로 만료되지 않아요. 정식 서비스로 전환되면 잔디마다 유효기간이 생길 수
            있고, 그 경우 충전 시점에 명확히 안내해드려요.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brown/5">
          <h2 className="text-sm font-bold text-coral-dark">사용 규칙</h2>
          <p className="mt-2 text-sm leading-relaxed text-brown-soft">
            잔디는 사주 상세 풀이·궁합 같은 유료 콘텐츠를 열거나, AI 상세 사주 리포트를 만들 때 사용돼요. 이미 만든
            AI 리포트는 같은 정보로 다시 만들어도 잔디가 다시 차감되지 않고, 마이페이지의 &ldquo;결제·사용
            내역&rdquo; 탭에서 언제든 다시 볼 수 있어요.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brown/5">
          <h2 className="text-sm font-bold text-coral-dark">환불 규정</h2>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-brown-soft">
            <li>· AI 리포트는 생성에 실패하면 잔디가 아예 차감되지 않아요 — 리포트가 만들어진 뒤에만 차감돼요.</li>
            <li>· 이미 열어본 유료 콘텐츠(사주 상세·궁합 등)는 특성상 환불이 어려워요.</li>
            <li>
              · 아직 쓰지 않은 잔디는 고객센터(준비 중)로 문의하면 환불해드려요. 묶음으로 충전한 잔디를 일부만 쓴
              경우의 부분환불 규정은 정식 서비스 전환 시 자세히 안내할게요.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
