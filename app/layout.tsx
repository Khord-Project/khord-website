import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { JsonLd } from "./_components/JsonLd";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const defaultTitle = "Khord — Privacy by Architecture";
const description =
  "Encrypted messaging where no single server sees the full picture.";

export const metadata: Metadata = {
  title: {
    default: defaultTitle,
    template: "%s — Khord",
  },
  description,
  metadataBase: new URL("https://khord.org"),
  openGraph: {
    title: defaultTitle,
    description,
    url: "https://khord.org",
    siteName: "Khord",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Khord Project",
  url: "https://khord.org",
  logo: "https://khord.org/logo.png",
  sameAs: ["https://github.com/Khord-Project"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Khord",
  url: "https://khord.org",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg font-sans">
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        {children}
      </body>
    </html>
  );
}
