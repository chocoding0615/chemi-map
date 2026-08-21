import MapCreateForm from "@/components/MapCreateForm";
import FoxMascot from "@/components/FoxMascot";
import MyMapBanner from "@/components/MyMapBanner";
import FoxVillage from "@/components/FoxVillage";

export const metadata = { title: "여우 마을 · 여우점" };

export default function ConnectionsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={64} prop="heart" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">여우 마을</h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-brown-soft">
        복실이랑 같이 가꾸는 나만의 마을이에요.
        <br />
        운세를 보고 꼬리를 모을수록 마을이 채워져요.
      </p>

      <FoxVillage />

      <div className="mt-10 w-full border-t border-brown/10 pt-8">
        <h2 className="text-sm font-semibold text-brown-soft/50">진짜 인연 매칭 만들기</h2>
        <p className="mt-1 text-xs leading-relaxed text-brown-soft/40">
          친구들이 생일과 MBTI를 넣으면, 나에게 어떤 사람인지 진짜로 알려줘요.
        </p>

        <MyMapBanner />

        <p className="mt-6 w-full text-center text-xs font-semibold text-brown-soft/40">새 지도 만들기</p>
        <div className="mt-3 w-full rounded-3xl bg-white p-6 shadow-xl shadow-brown/5 ring-1 ring-brown/5 sm:p-8">
          <MapCreateForm />
        </div>
      </div>
    </div>
  );
}
