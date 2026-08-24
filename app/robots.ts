import type { MetadataRoute } from "next";

const SITE_URL = "https://foxfortune.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/my", "/admin", "/letter", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
