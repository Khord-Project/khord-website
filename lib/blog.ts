import "server-only";

import type { ReactElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeReact from "rehype-react";

const OWNER = "Khord-Project";
const REPO = "khord";
const BRANCH = "main";
const ARTICLES_PATH = "docs/articles";
const REVALIDATE_SECONDS = 60 * 60;

type GitHubContentEntry = {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
};

export type PostFrontmatter = {
  title: string;
  date: string | null;
  excerpt: string | null;
  author: string | null;
};

export type PostSummary = PostFrontmatter & { slug: string };

export type Post = PostSummary & { content: ReactElement };

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_BOT_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_BOT_TOKEN}`;
  }
  return headers;
}

async function listArticleFiles(): Promise<string[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${ARTICLES_PATH}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: REVALIDATE_SECONDS, tags: ["khord-articles"] },
  });
  if (!res.ok) {
    throw new Error(
      `Failed to list articles: ${res.status} ${res.statusText}`,
    );
  }
  const entries = (await res.json()) as GitHubContentEntry[];
  return entries
    .filter((e) => e.type === "file" && e.name.endsWith(".md"))
    .map((e) => e.name);
}

async function fetchArticleRaw(fileName: string): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${ARTICLES_PATH}/${fileName}`;
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["khord-articles"] },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${fileName}: ${res.status} ${res.statusText}`,
    );
  }
  return res.text();
}

async function fetchCommitDate(fileName: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/commits?path=${ARTICLES_PATH}/${fileName}&per_page=1&sha=${BRANCH}`;
  const res = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: REVALIDATE_SECONDS, tags: ["khord-articles"] },
  });
  if (!res.ok) return null;
  const commits = (await res.json()) as Array<{
    commit?: { author?: { date?: string }; committer?: { date?: string } };
  }>;
  const c = commits[0];
  return c?.commit?.author?.date ?? c?.commit?.committer?.date ?? null;
}

function extractTitleAndBody(content: string): {
  title: string | null;
  body: string;
} {
  const lines = content.split("\n");
  let titleLine = -1;
  let title: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.+?)\s*$/);
    if (m) {
      title = m[1].trim();
      titleLine = i;
      break;
    }
  }
  if (titleLine === -1) return { title: null, body: content };
  const before = lines.slice(0, titleLine);
  let after = lines.slice(titleLine + 1);
  while (after.length && after[0].trim() === "") after.shift();
  if (after.length && /^-{3,}\s*$/.test(after[0])) {
    after.shift();
    while (after.length && after[0].trim() === "") after.shift();
  }
  return { title, body: [...before, ...after].join("\n").trim() };
}

function extractExcerpt(body: string, max = 240): string | null {
  const paragraphs = body.split(/\n\s*\n/);
  for (const raw of paragraphs) {
    const p = raw.trim();
    if (!p) continue;
    if (p.startsWith("#")) continue;
    if (/^-{3,}\s*$/.test(p)) continue;
    if (/^\*[^*]+\*$/.test(p)) continue;
    if (p.startsWith(">")) continue;
    if (p.startsWith("```")) continue;
    const clean = p
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (clean.length < 30) continue;
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trim() + "…";
  }
  return null;
}

function slugFromFileName(fileName: string): string {
  return fileName.replace(/\.md$/i, "");
}

async function renderMarkdown(md: string): Promise<ReactElement> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: ["heading-anchor"] },
    })
    .use(rehypePrettyCode, {
      theme: "github-dark-dimmed",
      keepBackground: false,
    })
    .use(rehypeReact, {
      Fragment,
      jsx,
      jsxs,
    })
    .process(md);
  return file.result as ReactElement;
}

async function loadSummaryFromFile(fileName: string): Promise<PostSummary | null> {
  const raw = await fetchArticleRaw(fileName);
  if (!raw) return null;
  const slug = slugFromFileName(fileName);
  const parsed = matter(raw);
  const fmTitle =
    typeof parsed.data.title === "string" ? parsed.data.title.trim() : null;
  const fmExcerpt =
    typeof parsed.data.excerpt === "string" ? parsed.data.excerpt.trim() : null;
  const fmAuthor =
    typeof parsed.data.author === "string" ? parsed.data.author.trim() : null;
  const fmDate =
    parsed.data.date != null
      ? typeof parsed.data.date === "string"
        ? parsed.data.date
        : new Date(parsed.data.date as string | number | Date).toISOString()
      : null;
  const { title: bodyTitle, body } = extractTitleAndBody(parsed.content);
  const title = fmTitle ?? bodyTitle ?? slug;
  const excerpt = fmExcerpt ?? extractExcerpt(body);
  const date = fmDate ?? (await fetchCommitDate(fileName));
  return {
    slug,
    title,
    date,
    excerpt,
    author: fmAuthor,
  };
}

export async function getAllPosts(): Promise<PostSummary[]> {
  const files = await listArticleFiles();
  const posts = (
    await Promise.all(files.map((f) => loadSummaryFromFile(f)))
  ).filter((p): p is PostSummary => p !== null);
  posts.sort((a, b) => {
    if (!a.date && !b.date) return a.slug.localeCompare(b.slug);
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date < b.date ? 1 : -1;
  });
  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fileName = `${slug}.md`;
  const raw = await fetchArticleRaw(fileName);
  if (!raw) return null;
  const parsed = matter(raw);
  const fmTitle =
    typeof parsed.data.title === "string" ? parsed.data.title.trim() : null;
  const fmExcerpt =
    typeof parsed.data.excerpt === "string" ? parsed.data.excerpt.trim() : null;
  const fmAuthor =
    typeof parsed.data.author === "string" ? parsed.data.author.trim() : null;
  const fmDate =
    parsed.data.date != null
      ? typeof parsed.data.date === "string"
        ? parsed.data.date
        : new Date(parsed.data.date as string | number | Date).toISOString()
      : null;
  const { title: bodyTitle, body } = extractTitleAndBody(parsed.content);
  const title = fmTitle ?? bodyTitle ?? slug;
  const excerpt = fmExcerpt ?? extractExcerpt(body);
  const date = fmDate ?? (await fetchCommitDate(fileName));
  const content = await renderMarkdown(body);
  return {
    slug,
    title,
    date,
    excerpt,
    author: fmAuthor,
    content,
  };
}

export function formatPostDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
