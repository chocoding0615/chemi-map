import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb } from "@/lib/firebaseAdmin";
import EntryForm from "@/components/EntryForm";
import EntryGallery from "@/components/EntryGallery";
import ShareBanner from "@/components/ShareBanner";
import type { EntryDoc } from "@/lib/types";

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
      visitorZodiac: data.visitorZodiac,
      visitorTemperament: data.visitorTemperament,
      resultTitle: data.resultTitle,
      resultAnimalBlurb: data.resultAnimalBlurb,
      resultRelationshipBlurb: data.resultRelationshipBlurb,
      createdAt: toIso(data.createdAt),
    };
  });

  return { ownerName: mapData.ownerName as string, entries };
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
    <div className="flex flex-1 flex-col items-center gap-6 bg-white px-6 py-16">
      {created === "1" && <ShareBanner slug={slug} />}

      <div className="text-center">
        <div className="text-5xl">🧭</div>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">{data.ownerName}님의 케미 지도</h1>
      </div>

      <EntryForm slug={slug} ownerName={data.ownerName} />

      <div className="w-full max-w-md">
        <h2 className="text-center text-sm font-medium text-neutral-400">지도에 등록된 사람들</h2>
        <EntryGallery entries={data.entries} />
      </div>
    </div>
  );
}
