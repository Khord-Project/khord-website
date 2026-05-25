import type { Metadata } from "next";

// One-time links must never be indexed or pre-fetched by crawlers — a bot
// hitting one could consume the secret. noindex here plus a robots.txt
// disallow on /s/ cover both.
export const metadata: Metadata = {
  title: "Shared contact",
  robots: { index: false, follow: false },
};

export default function SecretLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
