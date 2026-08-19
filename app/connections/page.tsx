import MapCreateForm from "@/components/MapCreateForm";
import FoxMascot from "@/components/FoxMascot";
import MyMapBanner from "@/components/MyMapBanner";

export const metadata = { title: "인연 지도 만들기 · 여우점" };

export default function ConnectionsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={64} prop="heart" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brown">인연 지도</h1>
      <p className="mt-3 text-center text-sm leading-relaxed text-brown-soft/60">
        내 지도를 만들어서 공유해보세요.
        <br />
        친구들이 생일과 MBTI를 넣으면, 나에게 어떤 사람인지 나와요.
      </p>

      <MyMapBanner />

      <p className="mt-8 w-full text-center text-xs font-semibold text-brown-soft/40">새 지도 만들기</p>
      <div className="mt-3 w-full rounded-3xl bg-white p-6 shadow-xl shadow-brown/5 ring-1 ring-brown/5 sm:p-8">
        <MapCreateForm />
      </div>
    </div>
  );
}
