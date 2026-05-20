import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../_components/Nav";
import { Footer } from "../_components/Footer";
import { getAllPosts, formatPostDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Khord",
  description:
    "Writing about the Khord protocol, privacy by architecture, and how it gets built.",
  openGraph: {
    title: "Blog — Khord",
    description:
      "Writing about the Khord protocol, privacy by architecture, and how it gets built.",
    url: "https://khord.org/blog",
  },
};

export const revalidate = 3600;

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Nav />
      <header className="px-6 pb-12 pt-32 text-center">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-glow">
          Blog
        </p>
        <h1 className="mx-auto max-w-[720px] font-serif text-[clamp(36px,6vw,56px)] font-normal leading-[1.1] text-fg">
          Notes from building Khord
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.7] text-fg-muted">
          Long-form writing on protocol design, threat models, and the
          decisions behind the code.
        </p>
      </header>

      <main className="mx-auto max-w-[760px] px-6 pb-24">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-border-subtle bg-surface px-7 py-10 text-center">
            <p className="text-base text-fg-muted">
              No articles yet. Check back soon.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-5">
            {posts.map((post) => {
              const dateLabel = formatPostDate(post.date);
              return (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block rounded-2xl border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-light"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-[13px] text-fg-dim">
                      {dateLabel && (
                        <time dateTime={post.date ?? undefined}>
                          {dateLabel}
                        </time>
                      )}
                      {dateLabel && post.author && <span aria-hidden>·</span>}
                      {post.author && <span>{post.author}</span>}
                    </div>
                    <h2 className="mb-3 font-serif text-[26px] font-normal leading-[1.2] text-fg transition-colors group-hover:text-primary-glow">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-[15px] leading-[1.65] text-fg-muted">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent transition-transform group-hover:translate-x-1">
                      Read article →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
}
