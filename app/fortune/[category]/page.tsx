import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FoxMascot from "@/components/FoxMascot";
import FortuneForm from "@/components/fortune/FortuneForm";
import AccessBadge from "@/components/common/AccessBadge";
import { FORTUNE_CATEGORIES, FORTUNE_CATEGORY_ORDER, type CategorySlug } from "@/lib/content/fortuneCategories";
import { FORTUNE_FREE_PREVIEW } from "@/lib/config";

interface FortuneCategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return FORTUNE_CATEGORY_ORDER.map((category) => ({ category }));
}

function isCategorySlug(value: string): value is CategorySlug {
  return (FORTUNE_CATEGORY_ORDER as string[]).includes(value);
}

export async function generateMetadata({ params }: FortuneCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isCategorySlug(category)) return { title: "여우점" };
  const entry = FORTUNE_CATEGORIES[category];
  return { title: `${entry.nameKo} · 여우점`, description: entry.description };
}

export default async function FortuneCategoryPage({ params }: FortuneCategoryPageProps) {
  const { category } = await params;
  if (!isCategorySlug(category)) notFound();
  const entry = FORTUNE_CATEGORIES[category];

  return (
    <div className="mx-auto flex w-full max-w-[480px] md:max-w-2xl flex-1 flex-col items-center px-6 py-16">
      <FoxMascot size={56} prop={entry.inputKind === "twoBirthdates" ? "heart" : "brush"} />
      <span className="mt-3 text-3xl">{entry.icon}</span>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-brown">{entry.nameKo}</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-brown-soft">{entry.description}</p>
      <div className="mt-3">
        <AccessBadge
          state={FORTUNE_FREE_PREVIEW ? { kind: "free" } : { kind: "price", priceKrw: entry.priceKrw }}
          size="md"
        />
      </div>

      <FortuneForm category={entry} />
    </div>
  );
}
