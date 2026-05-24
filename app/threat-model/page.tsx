import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Nav } from "../_components/Nav";
import { Footer } from "../_components/Footer";

export const metadata: Metadata = {
  title: "Threat Model",
  description:
    "What Khord protects, what it doesn't, and why we tell you both. Published threat model, data-flow diagram, and honest limits.",
  alternates: { canonical: "/threat-model" },
  openGraph: {
    title: "Threat Model — Khord",
    description:
      "What Khord protects, what it doesn't, and why we tell you both.",
    url: "https://khord.org/threat-model",
  },
};

const GREEN = "#4ADE80";
const TEAL = "#3AAFBF";
const AMBER = "#F4A261";

type Tone = "good" | "bad" | "neutral";
type Row = { label: string; value: ReactNode; tone: Tone };
type Scenario = { title: string; rows: Row[] };

const toneClass: Record<Tone, string> = {
  good: "text-primary-glow",
  bad: "text-accent",
  neutral: "text-fg-dim",
};

const scenarios: Scenario[] = [
  {
    title: "Someone hacks the Relay Server",
    rows: [
      { label: "What they see", tone: "bad", value: "Encrypted message blobs + mailbox UUIDs" },
      {
        label: "What they DON'T see",
        tone: "good",
        value: "Message content, sender identity, recipient identity",
      },
      { label: "What's exposed", tone: "bad", value: "Timing of message delivery, mailbox activity patterns" },
      {
        label: "Why",
        tone: "neutral",
        value:
          "The Relay Server never has encryption keys. Messages are sealed on your device before transmission.",
      },
    ],
  },
  {
    title: "Someone hacks the Key Server",
    rows: [
      { label: "What they see", tone: "bad", value: "Public keys + fingerprints" },
      {
        label: "What they DON'T see",
        tone: "good",
        value: "Messages, conversations, contacts, mailboxes",
      },
      {
        label: "What's exposed",
        tone: "bad",
        value:
          "Which fingerprints have registered (but fingerprints aren't linked to real-world identity)",
      },
      {
        label: "Why",
        tone: "neutral",
        value:
          "The Key Server handles identity, not communication. Public keys are public by design.",
      },
    ],
  },
  {
    title: "Someone hacks BOTH servers",
    rows: [
      { label: "What they see", tone: "bad", value: "Public keys + encrypted blobs + mailbox UUIDs" },
      {
        label: "What they can do",
        tone: "bad",
        value: "Correlate fingerprints to mailboxes (learn who talks to whom)",
      },
      { label: "What they still can't do", tone: "good", value: "Read message content" },
      {
        label: "Why",
        tone: "neutral",
        value:
          "Even with full server access, the private keys needed for decryption exist only on your device. But the split-trust benefit is gone — this is why running servers independently matters.",
      },
    ],
  },
  {
    title: "Your phone is seized while unlocked",
    rows: [
      {
        label: "What's exposed",
        tone: "bad",
        value: "Everything on screen — messages, contacts, seed phrase if you navigated there",
      },
      {
        label: "Mitigation",
        tone: "neutral",
        value:
          "The panic button instantly destroys all data. The database encryption key is erased from hardware. Forensic recovery finds only unreadable ciphertext.",
      },
    ],
  },
  {
    title: "Your phone is seized while locked",
    rows: [
      {
        label: "What protects you",
        tone: "good",
        value: "SQLCipher database encryption + Android Keystore hardware-backed key",
      },
      {
        label: "What an attacker needs",
        tone: "neutral",
        value:
          "Your device PIN/password/biometric, or a zero-day exploit against the hardware security chip",
      },
      {
        label: "Reality",
        tone: "neutral",
        value: "Device security is only as strong as your lock screen. A strong passcode matters.",
      },
    ],
  },
  {
    title: "A government subpoenas the community servers",
    rows: [
      {
        label: "Key Server can provide",
        tone: "bad",
        value: "Public keys and fingerprints (public information by design)",
      },
      {
        label: "Relay Server can provide",
        tone: "bad",
        value:
          "Encrypted blobs and mailbox UUIDs (unreadable without your private key, unlinkable to identity without also accessing the Key Server)",
      },
      {
        label: "Neither server can provide",
        tone: "good",
        value:
          "Message content, contact lists, group membership, or real-world identities — this information doesn't exist on the servers.",
      },
      {
        label: "Reference",
        tone: "neutral",
        value: (
          <>
            See the full{" "}
            <Link
              href="/commitment"
              className="text-primary-glow underline decoration-primary-glow/35 underline-offset-2 transition-colors hover:decoration-primary-glow"
            >
              Data Processing Commitment
            </Link>
          </>
        ),
      },
    ],
  },
  {
    title: "Someone intercepts your network traffic",
    rows: [
      { label: "What they see", tone: "bad", value: "TLS-encrypted connections to the server domains" },
      { label: "What they learn", tone: "bad", value: "That you use Khord, and when you're active" },
      {
        label: "What they can't see",
        tone: "good",
        value: "Message content (E2E encrypted inside the TLS tunnel), who you're talking to",
      },
      {
        label: "Note",
        tone: "neutral",
        value:
          "Traffic analysis resistance (padding, timing obfuscation) is on the roadmap but not yet implemented.",
      },
    ],
  },
  {
    title: "Someone gets your 12-word seed phrase",
    rows: [
      { label: "What they can do", tone: "bad", value: "Recover your cryptographic identity on a new device" },
      {
        label: "What they can't do",
        tone: "good",
        value: "Recover your message history, contact list, or active sessions",
      },
      {
        label: "What you should do",
        tone: "neutral",
        value:
          "Store your seed phrase offline, never digitally. If you suspect it's compromised, create a new identity.",
      },
    ],
  },
  {
    title: "A contact's device is compromised",
    rows: [
      {
        label: "What's exposed",
        tone: "bad",
        value: "Every message you sent TO that contact is readable on their device",
      },
      {
        label: "What's NOT exposed",
        tone: "good",
        value: "Your other conversations, your private key, your other contacts",
      },
      {
        label: "Why",
        tone: "neutral",
        value:
          "E2E encryption protects messages in transit and at rest on YOUR device. Once delivered and decrypted on the recipient's device, their device security governs.",
      },
    ],
  },
];

const limits: { term: string; desc: string }[] = [
  {
    term: "Compromised device",
    desc: "If your phone has malware with screen capture or keylogging, encryption can't help. The messages are readable on your screen. Use a device you trust.",
  },
  {
    term: "Recipient behavior",
    desc: "The person you message can screenshot, copy, or forward anything you send. E2E encryption protects the channel, not the endpoints.",
  },
  {
    term: "Traffic analysis",
    desc: "An adversary monitoring your network can observe when you connect to Khord servers and infer activity patterns. Message padding and timing obfuscation are on the roadmap but not yet implemented.",
  },
  {
    term: "Physical coercion",
    desc: "If someone forces you to unlock your phone, encryption doesn't help. The panic button is a mitigation — it destroys data before handover — but it requires you to have the opportunity to use it.",
  },
  {
    term: "No security audit yet",
    desc: "The protocol and code have not been professionally audited. The source code and protocol specification are public for community review. A professional audit is something we'd like to pursue when funding allows.",
  },
  {
    term: "Metadata at the network level",
    desc: "While the servers minimize metadata, your ISP or network operator can see that you're connecting to Khord's server IP addresses. A VPN or Tor can mitigate this, but Khord doesn't provide this layer itself.",
  },
];

const guarantees: string[] = [
  "The servers cannot read message content — they never have the keys.",
  "The servers cannot build a social graph from a single server compromise — identity and communication are split across two independent servers.",
  "The servers cannot identify group membership — groups exist only on client devices.",
  "A new server operator cannot access historical messages — messages are deleted after delivery or TTL expiry.",
  "The app cannot silently weaken encryption — the protocol is specified publicly, the code is open source, and the cryptographic primitives are industry-standard (libsodium).",
];

const diagramNodes: {
  name: string;
  color: string;
  boundary: boolean;
  desc: string;
}[] = [
  {
    name: "Your Device",
    color: GREEN,
    boundary: false,
    desc: "Private keys, message content, contacts, groups — everything sensitive lives here.",
  },
  {
    name: "Key Server",
    color: TEAL,
    boundary: true,
    desc: "Public keys only. Knows identity, not conversations.",
  },
  {
    name: "Relay Server",
    color: AMBER,
    boundary: true,
    desc: "Encrypted blobs only. Routes messages, knows nothing about identity.",
  },
  {
    name: "Contact's Device",
    color: GREEN,
    boundary: false,
    desc: "Decrypted messages. Their security is their responsibility.",
  },
];

const diagramFlows: {
  from: string;
  fromColor: string;
  to: string;
  toColor: string;
  label: string;
}[] = [
  { from: "Your Device", fromColor: GREEN, to: "Key Server", toColor: TEAL, label: "public keys" },
  { from: "Your Device", fromColor: GREEN, to: "Relay Server", toColor: AMBER, label: "encrypted message" },
  { from: "Relay Server", fromColor: AMBER, to: "Contact's Device", toColor: GREEN, label: "encrypted message" },
];

const pageLinks: { label: string; href: string; external?: boolean }[] = [
  {
    label: "Protocol Specification",
    href: "https://github.com/Khord-Project/khord/blob/main/docs/PROTOCOL.md",
    external: true,
  },
  {
    label: "Architecture Decisions",
    href: "https://github.com/Khord-Project/khord/tree/main/docs/decisions",
    external: true,
  },
  { label: "Data Processing Commitment", href: "/commitment" },
  {
    label: "Full source code",
    href: "https://github.com/Khord-Project/khord",
    external: true,
  },
];

function ScenarioItem({ title, rows }: Scenario) {
  return (
    <details className="group rounded-xl border border-border bg-surface px-6 transition-colors open:border-primary-light/60 hover:border-primary-light/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[16px] font-medium text-fg [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
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
      <dl className="flex flex-col gap-3 pb-5">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <dt
              className={`flex-shrink-0 text-[13px] font-semibold uppercase tracking-wide sm:w-44 ${toneClass[row.tone]}`}
            >
              {row.label}
            </dt>
            <dd className="text-[15px] leading-[1.6] text-fg-muted">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

function DataFlowDiagram() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {diagramNodes.map((node) => (
          <div
            key={node.name}
            className={`rounded-xl bg-bg-subtle p-5 ${
              node.boundary
                ? "border-2 border-dashed"
                : "border border-border"
            }`}
            style={
              node.boundary
                ? ({ borderColor: `${node.color}66` } as CSSProperties)
                : undefined
            }
          >
            {node.boundary && (
              <span
                className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: node.color }}
              >
                Trust boundary
              </span>
            )}
            <h3
              className="text-[15px] font-semibold"
              style={{ color: node.color }}
            >
              {node.name}
            </h3>
            <p className="mt-2 text-[13px] leading-[1.55] text-fg-muted">
              {node.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border-subtle pt-6">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-fg-dim">
          Data flows
        </p>
        <ul className="flex flex-col gap-2.5">
          {diagramFlows.map((flow, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px]"
            >
              <span className="font-medium" style={{ color: flow.fromColor }}>
                {flow.from}
              </span>
              <span aria-hidden className="text-fg-dim">
                →
              </span>
              <span className="font-medium" style={{ color: flow.toColor }}>
                {flow.to}
              </span>
              <span className="ml-1 rounded-full border border-border-subtle bg-bg px-2.5 py-0.5 text-[12px] text-fg-muted">
                {flow.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-[13px] leading-[1.6] text-fg-dim">
        Dashed boxes mark trust boundaries. Compromising a server reveals only
        what is listed in its box — never private keys or message content, which
        live exclusively on devices.
      </p>
    </div>
  );
}

export default function ThreatModelPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Nav />

      <header className="mx-auto max-w-[760px] px-6 pb-12 pt-32">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-glow">
          Transparency
        </p>
        <h1 className="font-serif text-[clamp(36px,6vw,56px)] font-normal leading-[1.1] text-fg">
          Threat Model
        </h1>
        <p className="mt-5 font-serif text-[clamp(18px,3vw,22px)] italic leading-snug text-fg-muted">
          What Khord protects, what it doesn&apos;t, and why we tell you both.
        </p>
        <p className="mt-6 text-[17px] leading-[1.7] text-fg-muted">
          Most encrypted messengers ask you to trust that they&apos;re secure.
          We&apos;d rather show you exactly what we protect against, where the
          limits are, and what the architecture makes structurally impossible
          versus what relies on operational trust.
        </p>
      </header>

      <main className="mx-auto max-w-[760px] px-6 pb-24">
        <section className="mb-16">
          <h2 className="mb-5 font-serif text-[clamp(24px,4vw,32px)] font-normal leading-tight text-fg">
            What happens when things go wrong
          </h2>
          <div className="flex flex-col gap-3">
            {scenarios.map((s) => (
              <ScenarioItem key={s.title} title={s.title} rows={s.rows} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-5 font-serif text-[clamp(24px,4vw,32px)] font-normal leading-tight text-fg">
            How your data flows
          </h2>
          <DataFlowDiagram />
        </section>

        <section className="mb-16">
          <h2 className="mb-3 font-serif text-[clamp(24px,4vw,32px)] font-normal leading-tight text-fg">
            Honest limits
          </h2>
          <p className="mb-6 text-[16px] leading-[1.7] text-fg-muted">
            No system is invulnerable. Here&apos;s what Khord doesn&apos;t
            protect against, and why.
          </p>
          <div className="flex flex-col gap-3">
            {limits.map((limit) => (
              <div
                key={limit.term}
                className="rounded-xl border border-border bg-surface px-6 py-5"
              >
                <h3 className="mb-1.5 text-base font-semibold text-accent">
                  {limit.term}
                </h3>
                <p className="text-[15px] leading-[1.65] text-fg-muted">
                  {limit.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-3 font-serif text-[clamp(24px,4vw,32px)] font-normal leading-tight text-fg">
            What the architecture makes impossible
          </h2>
          <p className="mb-6 text-[16px] leading-[1.7] text-fg-muted">
            These aren&apos;t promises or policies — they&apos;re structural
            properties of the design.
          </p>
          <ul className="flex flex-col gap-3">
            {guarantees.map((g) => (
              <li
                key={g}
                className="flex gap-3 rounded-xl border border-border-subtle bg-bg-subtle px-5 py-4"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-glow"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[15px] leading-[1.6] text-fg">{g}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-border-subtle pt-10">
          <h2 className="mb-5 text-[13px] font-semibold uppercase tracking-[0.1em] text-fg-dim">
            Verify for yourself
          </h2>
          <div className="flex flex-wrap gap-3">
            {pageLinks.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:border-primary-light hover:text-fg"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:border-primary-light hover:text-fg"
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
