import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nav } from "../_components/Nav";
import { Footer } from "../_components/Footer";
import { JsonLd } from "../_components/JsonLd";

const description =
  "Answers about Khord's split-trust architecture, security, identity, self-hosting, and platform support.";

export const metadata: Metadata = {
  title: "FAQ",
  description,
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ — Khord",
    description,
    url: "https://khord.org/faq",
  },
};

const code =
  "rounded bg-bg-subtle border border-border-subtle px-1.5 py-0.5 text-[0.85em] text-accent font-mono";

const link =
  "text-primary-glow underline decoration-primary-glow/35 underline-offset-2 transition-colors hover:decoration-primary-glow";

// `a` is rendered; `text` is the plain-text fallback used for FAQPage JSON-LD
// when `a` is not a plain string (e.g. contains links).
type QA = { q: string; a: ReactNode; text?: string };
type Category = { name: string; items: QA[] };

const categories: Category[] = [
  {
    name: "General",
    items: [
      {
        q: "What is Khord?",
        a: "An end-to-end encrypted messenger built on a split-trust architecture. Two independent servers each hold half the picture — the Key Server knows your identity but not your conversations, the Relay Server routes your messages but not your identity. Neither can reconstruct the whole.",
      },
      {
        q: "How is Khord different from Signal?",
        a: "Signal uses a single server infrastructure operated by one organization. Khord splits the trust across two independent servers that share zero state. Khord requires no phone number or email — your identity is a cryptographic key. Khord is designed to be self-hosted by anyone. The protocol primitives are the same (X3DH + Double Ratchet on libsodium).",
      },
      {
        q: "How is Khord different from Threema?",
        a: "Threema is a commercial product with proprietary server code. Khord is fully open source (AGPL-3.0 server code, CC-BY-SA-4.0 protocol spec). Both use key-based identity without phone numbers. Khord's split-trust architecture goes further in separating who knows what.",
      },
      {
        q: "Is Khord free?",
        a: "Yes. The app, the server code, and the protocol specification are all free and open source. The community servers are operated at no cost. You can self-host your own servers at any time.",
      },
    ],
  },
  {
    name: "Security",
    items: [
      {
        q: "Has Khord been security audited?",
        a: "Not yet. A professional security audit is something we'd like to pursue, but these are expensive and would depend on community funding or sponsorship. Khord is currently a proof of concept under active development. The protocol specification and all source code are public — anyone can review them. Khord is fully functional for daily messaging — even without an audit, it collects zero metadata and no message content ever reaches our servers in readable form. For high-stakes communication, self-host your own servers.",
      },
      {
        q: "What encryption does Khord use?",
        a: "Signal Protocol — X3DH key agreement plus Double Ratchet for message encryption. Implemented on libsodium primitives: Ed25519 for identity keys, X25519 for key exchange, XChaCha20-Poly1305 for AEAD encryption, Argon2id for key derivation from seed phrases.",
      },
      {
        q: "Can the server operators read my messages?",
        a: "No. Messages are end-to-end encrypted on your device before they reach any server. The Relay Server sees only sealed, encrypted blobs. The Key Server sees only your public keys. Neither server has the private keys needed to decrypt message content.",
      },
      {
        q: "What happens if a server is compromised?",
        a: "Compromising one server is not enough. The Key Server knows identities but not conversations. The Relay Server routes messages but not identities. An attacker would need to compromise both servers independently to correlate who is talking to whom — and even then, message content remains encrypted.",
      },
    ],
  },
  {
    name: "Identity",
    items: [
      {
        q: "Do I need a phone number or email?",
        a: "No. Your identity is a cryptographic key pair generated from a 12-word seed phrase on your device. The servers don't know who you are in the real world.",
      },
      {
        q: "What is the seed phrase?",
        a: "A 12-word recovery phrase (BIP39 standard) that deterministically generates your identity key. Write it down and store it safely. If you lose access to your device, the seed phrase is the only way to recover your identity.",
      },
      {
        q: "What happens if I lose my phone?",
        a: "Enter your seed phrase on a new installation to recover your identity. Your contacts will recognize you (same fingerprint). Message history and contact list cannot be recovered — only the identity itself.",
      },
    ],
  },
  {
    name: "Self-Hosting",
    items: [
      {
        q: "Can I run my own servers?",
        a: (
          <>
            Yes. Both servers are Docker containers. A basic deployment takes
            one <code className={code}>docker compose up</code> command. See the{" "}
            <a
              href="https://github.com/Khord-Project/khord/tree/main/deploy"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              deployment guide
            </a>{" "}
            for details.
          </>
        ),
        text: "Yes. Both servers are Docker containers. A basic deployment takes one `docker compose up` command. See the deployment guide for details.",
      },
      {
        q: "Do I need to run both servers?",
        a: "You can mix and match. Run your own Relay Server (for metadata control) while using a community Key Server, or run both. The split-trust model is designed for independent operation.",
      },
      {
        q: "Can different organizations run different servers?",
        a: "Yes. That's the point. Non-profits, universities, companies, individuals — anyone can operate servers. The more independent operators, the more resilient and trustworthy the network.",
      },
    ],
  },
  {
    name: "Platform",
    items: [
      {
        q: "Is there an iOS app?",
        a: "Not yet. The shared encryption module is built with Kotlin Multiplatform, so an iOS client is architecturally possible. It's on the roadmap but not currently scheduled.",
      },
      {
        q: "Is there a web interface?",
        a: "In design phase. A browser-based client is planned with two modes: a phone-companion mode (strongest security) and a seed-phrase mode (convenience).",
      },
      {
        q: "Is Khord on F-Droid?",
        a: (
          <>
            Not yet. F-Droid submission is in progress. In the meantime, download
            the APK directly from{" "}
            <a
              href="https://github.com/Khord-Project/khord/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              GitHub Releases
            </a>
            .
          </>
        ),
        text: "Not yet. F-Droid submission is in progress. In the meantime, download the APK directly from GitHub Releases.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: categories.flatMap((category) =>
    category.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: typeof item.a === "string" ? item.a : (item.text ?? ""),
      },
    })),
  ),
};

function FaqItem({ q, a }: QA) {
  return (
    <details className="group rounded-xl border border-border bg-surface px-6 transition-colors open:border-primary-light/60 hover:border-primary-light/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[16px] font-medium text-fg [&::-webkit-details-marker]:hidden">
        <span>{q}</span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4 flex-shrink-0 text-fg-dim transition-transform duration-200 group-open:rotate-180"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      <div className="pb-5 text-[15px] leading-[1.65] text-fg-muted">{a}</div>
    </details>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <JsonLd data={faqJsonLd} />
      <Nav />

      <header className="px-6 pb-12 pt-32 text-center">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-glow">
          FAQ
        </p>
        <h1 className="mx-auto max-w-[720px] font-serif text-[clamp(36px,6vw,56px)] font-normal leading-[1.1] text-fg">
          Frequently asked questions
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.7] text-fg-muted">
          How Khord works, what it protects, and how to run it yourself.
        </p>
      </header>

      <main className="mx-auto max-w-[760px] px-6 pb-24">
        {categories.map((category) => (
          <section key={category.name} className="mb-12 last:mb-0">
            <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-accent">
              {category.name}
            </h2>
            <div className="flex flex-col gap-3">
              {category.items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}
