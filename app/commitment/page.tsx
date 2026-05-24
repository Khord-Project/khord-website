import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nav } from "../_components/Nav";
import { Footer } from "../_components/Footer";

export const metadata: Metadata = {
  title: "Data Processing Commitment",
  description:
    "What the community servers at keys.khord.org and relay.khord.org store, and what they don't.",
  alternates: { canonical: "/commitment" },
  openGraph: {
    title: "Data Processing Commitment — Khord",
    description:
      "What the community servers at keys.khord.org and relay.khord.org store, and what they don't.",
    url: "https://khord.org/commitment",
  },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-12 last:mb-0">
      <h2 className="mb-4 font-serif text-[clamp(22px,4vw,28px)] font-normal leading-tight text-fg">
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletCard({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-6 py-5">
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-[15px] leading-[1.65] text-fg-muted"
          >
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-glow/70"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const keyServerStores = [
  "Your public identity key (Ed25519 public key)",
  "Your public signed pre-key and one-time pre-keys (used for initial key exchange)",
  "A fingerprint derived from your public key (used as an identifier)",
  "No email, phone number, username, IP address, or real-world identity",
];

const relayServerStores = [
  "Encrypted message blobs, sealed on your device before transmission",
  "Per-contact mailbox identifiers (random UUIDs, not linked to identity)",
  "Messages are deleted after delivery or after a configurable TTL (default: 7 days)",
  "No sender identity, no recipient identity, no message content, no metadata linking mailboxes to users",
];

const neitherStores = [
  "Private keys (these never leave your device)",
  "Message content in readable form",
  "Contact lists or social graphs",
  "Group membership (groups are a client-only concept — the servers have no awareness of groups)",
  "Location data, device identifiers, or usage analytics",
  "IP addresses are not logged beyond standard web server operation",
];

const subpoena = [
  "The Key Server could provide: public keys and fingerprints. This is information that is public by design — it's what contacts need to send you encrypted messages.",
  "The Relay Server could provide: encrypted blobs and mailbox IDs. Without the recipient's private key, message content is unreadable. Mailbox IDs cannot be correlated to identities without also accessing the Key Server.",
  "Neither server can provide message content, contact lists, or group membership under any circumstances — they don't have this information.",
];

const dontDo = [
  "No analytics, telemetry, or tracking",
  "No advertising",
  "No data sharing with third parties",
  "No monetization of user data",
  "No silent changes to this commitment — updates are versioned and published in the project repository",
];

export default function CommitmentPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Nav />

      <header className="mx-auto max-w-[760px] px-6 pb-12 pt-32">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-glow">
          Transparency
        </p>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal leading-[1.15] text-fg">
          Data Processing Commitment — Community Servers
        </h1>
        <p className="mt-5 text-[17px] leading-[1.7] text-fg-muted">
          What the community servers at keys.khord.org and relay.khord.org
          store, and what they don&apos;t.
        </p>
      </header>

      <main className="mx-auto max-w-[760px] px-6 pb-24">
        <Section title="What the Key Server stores">
          <BulletCard items={keyServerStores} />
        </Section>

        <Section title="What the Relay Server stores">
          <BulletCard items={relayServerStores} />
        </Section>

        <Section title="What neither server stores">
          <BulletCard items={neitherStores} />
        </Section>

        <Section title="What happens if the servers are subpoenaed">
          <BulletCard items={subpoena} />
        </Section>

        <Section title="What we don't do">
          <BulletCard items={dontDo} />
        </Section>

        <Section title="Self-hosting changes everything">
          <p className="text-[15px] leading-[1.7] text-fg-muted">
            This commitment applies to the community servers operated by the
            Khord project. If you self-host, your servers are under your control
            and your policies. The Khord software stores only the minimum data
            described above, but the operator determines retention policies,
            access controls, and legal jurisdiction.
          </p>
        </Section>

        <Section title="Version">
          <p className="text-[15px] leading-[1.7] text-fg-muted">
            This commitment was last updated May 2026. Changes are tracked at{" "}
            <a
              href="https://github.com/Khord-Project/khord"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-glow underline decoration-primary-glow/35 underline-offset-2 transition-colors hover:decoration-primary-glow"
            >
              github.com/Khord-Project/khord
            </a>
            .
          </p>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
