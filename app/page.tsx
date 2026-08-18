import MapCreateForm from "@/components/MapCreateForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-white px-6 py-16">
      <div className="text-center">
        <div className="text-5xl">🧭</div>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">케미 지도</h1>
        <p className="mt-2 text-sm text-neutral-500">
          내 지도를 만들어서 공유해보세요.
          <br />
          친구들이 생일과 MBTI를 넣으면, 나에게 어떤 사람인지 나와요.
        </p>
      </div>
      <MapCreateForm />
    </div>
  );
}
