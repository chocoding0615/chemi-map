import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb } from "@/lib/firebaseAdmin";
import EntryForm from "@/components/EntryForm";
import OrbitMap from "@/components/OrbitMap";
import ChemiRankList from "@/components/ChemiRankList";
import ShareBanner from "@/components/ShareBanner";
import type { EntryDoc } from "@/lib/types";
import type { ElementKey } from "@/lib/result-engine/elements";

interface MapPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string }>;
}

function toIso(value: unknown): string {
  if (value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

async function getMapData(slug: string) {
  const db = getDb();
  const mapSnap = await db.collection("maps").doc(slug).get();
  if (!mapSnap.exists) return null;
  const mapData = mapSnap.data()!;

  const entriesSnap = await db
    .collection("maps")
    .doc(slug)
    .collection("entries")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const entries: EntryDoc[] = entriesSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      visitorName: data.visitorName,
      visitorMbti: data.visitorMbti,
      visitorBirthdate: data.visitorBirthdate,
      visitorBirthTime: data.visitorBirthTime ?? null,
      visitorElement: data.visitorElement,
      visitorElementDistribution: data.visitorElementDistribution,
      visitorHasTimeInput: data.visitorHasTimeInput,
      visitorTemperament: data.visitorTemperament,
      affinityCategory: data.affinityCategory,
      affinityScore: data.affinityScore,
      seasonType: data.seasonType,
      resultTitle: data.resultTitle,
      resultElementBlurb: data.resultElementBlurb,
      resultAffinityBlurb: data.resultAffinityBlurb,
      resultDistributionBlurb: data.resultDistributionBlurb,
      resultPillarText: data.resultPillarText,
      createdAt: toIso(data.createdAt),
    };
  });

  return {
    ownerName: mapData.ownerName as string,
    ownerElement: mapData.ownerElement as ElementKey,
    entryCount: (mapData.entryCount as number) ?? 0,
    entries,
  };
}

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
  const { slug } = await params;
  const mapSnap = await getDb().collection("maps").doc(slug).get();
  const ownerName = mapSnap.exists ? (mapSnap.data()?.ownerName as string) : "누군가";
  return {
    title: `${ownerName}님의 케미 지도`,
    description: "생일과 MBTI만 넣으면, 내가 이 사람에게 어떤 사람인지 나와요.",
  };
}

export default async function MapPage({ params, searchParams }: MapPageProps) {
  const { slug } = await params;
  const { created } = await searchParams;

  const data = await getMapData(slug);
  if (!data) notFound();

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-16">
      {created === "1" && <ShareBanner slug={slug} />}

      <div className="text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl shadow-md ring-4 ring-white/60">
          🧭
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-amber-950">
          {data.ownerName}님의 케미 지도
        </h1>
        <p className="mt-1 text-sm font-semibold text-amber-900/50">{data.entryCount}명이 다녀갔어요</p>
      </div>

      <OrbitMap ownerName={data.ownerName} ownerElement={data.ownerElement} entries={data.entries} />

      <div
        id="entry-form"
        className="w-full max-w-sm scroll-mt-8 rounded-3xl bg-white p-6 shadow-xl shadow-amber-900/5 ring-1 ring-amber-900/5 sm:p-8"
      >
        <EntryForm slug={slug} ownerName={data.ownerName} />
      </div>

      <ChemiRankList entries={data.entries} />
    </div>
  );
}
