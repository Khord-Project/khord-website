import { ogImage, size, contentType } from "../../_og/og-image";
import { getPostBySlug } from "@/lib/blog";

export { size, contentType };
export const alt = "Khord blog post";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return ogImage("Blog", post?.title ?? "Khord");
}
