import type { MetadataRoute } from "next";
import { FORTUNE_CATEGORY_ORDER } from "@/lib/content/fortuneCategories";
import { DIARY_ENTRIES } from "@/lib/content/diary";

const SITE_URL = "https://foxfortune.vercel.app";

// 로그인 필요/개인화 페이지(/my, /admin, /letter/*, /m/[slug])는 검색엔진에 노출할
// 이유가 없어서 빼고, 공개 콘텐츠 페이지만 담는다.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/saju",
    "/today",
    "/fortune/monthly",
    "/fox-type",
    "/collection",
    "/connections",
    "/daily-charm",
    "/diary",
    "/terms",
    "/privacy",
  ];

  const fortuneRoutes = FORTUNE_CATEGORY_ORDER.map((category) => `/fortune/${category}`);
  const diaryRoutes = DIARY_ENTRIES.map((entry) => `/diary/${entry.id}`);

  return [...staticRoutes, ...fortuneRoutes, ...diaryRoutes].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
}
