import MapCreateForm from "@/components/MapCreateForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl shadow-md ring-4 ring-white/60">
          🧭
        </div>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-amber-950">
          케미 지도
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-amber-900/60">
          내 지도를 만들어서 공유해보세요.
          <br />
          친구들이 생일과 MBTI를 넣으면, 나에게 어떤 사람인지 나와요.
        </p>
      </div>
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl shadow-amber-900/5 ring-1 ring-amber-900/5 sm:p-8">
        <MapCreateForm />
      </div>
    </div>
  );
}
