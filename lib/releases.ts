import "server-only";

import type { ReactElement } from "react";
import { renderMarkdown } from "./markdown";

const OWNER = "Khord-Project";
const REPO = "khord";
const REVALIDATE_SECONDS = 60 * 60;

export const RELEASES_URL = `https://github.com/${OWNER}/${REPO}/releases`;

type GitHubAsset = {
  name: string;
  browser_download_url: string;
};

type GitHubRelease = {
  tag_name: string;
  name: string | null;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
  html_url: string;
  body: string | null;
  assets: GitHubAsset[];
};

export type Release = {
  tag: string;
  name: string;
  date: string | null;
  prerelease: boolean;
  htmlUrl: string;
  apkUrl: string | null;
  body: ReactElement | null;
};

export type ReleasesResult =
  | { ok: true; releases: Release[] }
  | { ok: false; error: string };

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

export async function getReleases(): Promise<ReleasesResult> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/releases?per_page=50`,
      {
        headers: githubHeaders(),
        next: { revalidate: REVALIDATE_SECONDS, tags: ["khord-releases"] },
      },
    );
    if (!res.ok) {
      return { ok: false, error: `GitHub API returned ${res.status}` };
    }
    const raw = (await res.json()) as GitHubRelease[];
    const releases = await Promise.all(
      raw
        .filter((r) => !r.draft)
        .map(async (r): Promise<Release> => {
          const apk = r.assets.find((a) =>
            a.name.toLowerCase().endsWith(".apk"),
          );
          const body =
            r.body && r.body.trim() ? await renderMarkdown(r.body) : null;
          return {
            tag: r.tag_name,
            name: r.name?.trim() || r.tag_name,
            date: r.published_at,
            prerelease: r.prerelease,
            htmlUrl: r.html_url,
            apkUrl: apk?.browser_download_url ?? null,
            body,
          };
        }),
    );
    return { ok: true, releases };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export function formatReleaseDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
