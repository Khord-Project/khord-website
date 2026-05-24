import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = "https://khord.org";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/self-host`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${BASE_URL}/threat-model`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/commitment`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: `${BASE_URL}/changelog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPosts();
    postRoutes = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // If the article source is unreachable at build time, still emit the
    // static routes rather than failing the whole sitemap.
  }

  return [...staticRoutes, ...postRoutes];
}
