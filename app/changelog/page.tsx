import type { Metadata } from "next";
import { Nav } from "../_components/Nav";
import { Footer } from "../_components/Footer";
import {
  getReleases,
  formatReleaseDate,
  RELEASES_URL,
} from "@/lib/releases";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Release history for the Khord app and servers.",
  alternates: { canonical: "/changelog" },
  openGraph: {
    title: "Changelog — Khord",
    description: "Release history for the Khord app and servers.",
    url: "https://khord.org/changelog",
  },
};

export const revalidate = 3600;

export default async function ChangelogPage() {
  const result = await getReleases();

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Nav />

      <header className="px-6 pb-12 pt-32 text-center">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-glow">
          Changelog
        </p>
        <h1 className="mx-auto max-w-[720px] font-serif text-[clamp(36px,6vw,56px)] font-normal leading-[1.1] text-fg">
          Release history
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.7] text-fg-muted">
          Every Khord release, newest first. Download an APK or read the notes.
        </p>
      </header>

      <main className="mx-auto max-w-[760px] px-6 pb-24">
        {!result.ok ? (
          <div className="rounded-2xl border border-border-subtle bg-surface px-7 py-10 text-center">
            <p className="text-base text-fg-muted">Couldn&apos;t load releases.</p>
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:border-primary-light hover:text-fg"
            >
              View releases on GitHub →
            </a>
          </div>
        ) : result.releases.length === 0 ? (
          <div className="rounded-2xl border border-border-subtle bg-surface px-7 py-10 text-center">
            <p className="text-base text-fg-muted">No releases yet.</p>
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:border-primary-light hover:text-fg"
            >
              View releases on GitHub →
            </a>
          </div>
        ) : (
          <ol className="relative ml-2 border-l border-border-subtle">
            {result.releases.map((release) => {
              const dateLabel = formatReleaseDate(release.date);
              return (
                <li key={release.tag} className="relative pb-10 pl-8 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -left-[6px] top-2 h-3 w-3 rounded-full bg-primary-glow ring-4 ring-bg"
                  />
                  <div className="rounded-2xl border border-border bg-surface p-7">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-serif text-[24px] font-normal leading-none text-fg">
                        {release.tag}
                      </h2>
                      {release.prerelease && (
                        <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                          Pre-release
                        </span>
                      )}
                    </div>
                    {dateLabel && (
                      <time
                        dateTime={release.date ?? undefined}
                        className="mt-2 block text-[13px] text-fg-dim"
                      >
                        {dateLabel}
                      </time>
                    )}

                    {release.body && (
                      <div className="prose-khord mt-5 text-[15px]">
                        {release.body}
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      {release.apkUrl && (
                        <a
                          href={release.apkUrl}
                          className="rounded-[10px] bg-gradient-to-br from-primary to-primary-light px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_24px_#1A535C40] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_#1A535C60]"
                        >
                          Download APK
                        </a>
                      )}
                      <a
                        href={release.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-[10px] border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:border-primary-light hover:text-fg"
                      >
                        View on GitHub
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </main>

      <Footer />
    </div>
  );
}
