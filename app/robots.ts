import type { MetadataRoute } from "next";

const BASE_URL = "https://khord.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /s/ holds one-time links — a crawler must never fetch one.
      disallow: ["/api/", "/s/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
