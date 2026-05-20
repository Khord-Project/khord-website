import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "../../_components/Nav";
import { Footer } from "../../_components/Footer";
import { getAllPosts, getPostBySlug, formatPostDate } from "@/lib/blog";

type RouteParams = { slug: string };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<RouteParams[]> {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found — Khord" };
  const title = `${post.title} — Khord`;
  const description = post.excerpt ?? undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://khord.org/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date ?? undefined,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const dateLabel = formatPostDate(post.date);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Nav />

      <article className="mx-auto max-w-[720px] px-6 pb-24 pt-32">
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-1 text-[13px] font-medium text-fg-dim transition-colors hover:text-fg-muted"
        >
          ← All articles
        </Link>

        <header className="mb-10">
          <h1 className="mb-5 font-serif text-[clamp(32px,5vw,48px)] font-normal leading-[1.15] text-fg">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-fg-dim">
            {dateLabel && (
              <time dateTime={post.date ?? undefined}>{dateLabel}</time>
            )}
            {dateLabel && post.author && <span aria-hidden>·</span>}
            {post.author && <span>{post.author}</span>}
          </div>
        </header>

        <div className="prose-khord">{post.content}</div>

        <div className="mt-16 border-t border-border-subtle pt-8 text-center">
          <a
            href={`https://github.com/Khord-Project/khord/blob/main/docs/articles/${post.slug}.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-fg-dim transition-colors hover:text-fg-muted"
          >
            View source on GitHub
          </a>
        </div>
      </article>

      <Footer />
    </div>
  );
}
