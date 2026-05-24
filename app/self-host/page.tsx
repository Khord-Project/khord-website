import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nav } from "../_components/Nav";
import { Footer } from "../_components/Footer";

export const metadata: Metadata = {
  title: "Self-Hosting Guide",
  description:
    "Run your own Khord servers with Docker. A step-by-step guide to self-hosting the Key Server and Relay Server.",
  alternates: { canonical: "/self-host" },
  openGraph: {
    title: "Self-Hosting Guide — Khord",
    description:
      "Run your own Khord servers with Docker. A step-by-step guide to self-hosting the Key Server and Relay Server.",
    url: "https://khord.org/self-host",
  },
};

const inlineCode =
  "rounded bg-bg-subtle border border-border-subtle px-1.5 py-0.5 text-[0.85em] text-accent font-mono break-words";

const link =
  "text-primary-glow underline decoration-primary-glow/35 underline-offset-2 transition-colors hover:decoration-primary-glow";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-12 last:mb-0">
      <h2 className="mb-4 font-serif text-[clamp(22px,4vw,28px)] font-normal leading-tight text-fg">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Prose({ children }: { children: ReactNode }) {
  return (
    <p className="text-[15px] leading-[1.7] text-fg-muted">{children}</p>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border-subtle bg-bg-subtle px-5 py-4 text-[13.5px] leading-[1.6] text-fg">
      <code className="font-mono">{children}</code>
    </pre>
  );
}

function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li
          key={i}
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
  );
}

const quickStart = `git clone https://github.com/Khord-Project/khord.git
cd khord/deploy
cp .env.example .env
# Edit .env — set your domain names and generate passwords:
#   openssl rand -hex 32   (for KEY_SERVER_TOKEN_SECRET)
#   openssl rand -hex 16   (for database passwords)
docker compose up -d`;

const verify = `curl https://keys.yourdomain.org/v1/health
# → {"status": "ok"}

curl https://relay.yourdomain.org/v1/health
# → {"status": "ok"}`;

export default function SelfHostPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Nav />

      <header className="mx-auto max-w-[760px] px-6 pb-12 pt-32">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-glow">
          Self-Hosting
        </p>
        <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-normal leading-[1.15] text-fg">
          Self-Hosting Guide
        </h1>
        <p className="mt-5 text-[17px] leading-[1.7] text-fg-muted">
          Run your own Key Server and Relay Server with Docker. Your metadata
          never leaves your network.
        </p>
      </header>

      <main className="mx-auto max-w-[760px] px-6 pb-24">
        <Section title="Why self-host?">
          <Prose>
            The community servers at keys.khord.org and relay.khord.org are a
            starting point for testing. Self-hosting gives you full control over
            your messaging infrastructure — your metadata never leaves your
            network, you choose the jurisdiction, and you don&apos;t depend on
            anyone else&apos;s uptime or policies.
          </Prose>
        </Section>

        <Section title="What you need">
          <BulletList
            items={[
              "A Linux server (VPS, home server, Raspberry Pi — anything that runs Docker)",
              "Docker and Docker Compose installed",
              <>
                A domain name with two subdomains (e.g.,{" "}
                <code className={inlineCode}>keys.yourdomain.org</code> and{" "}
                <code className={inlineCode}>relay.yourdomain.org</code>)
              </>,
              "Basic command-line familiarity",
            ]}
          />
        </Section>

        <Section title="Quick start (5 minutes)">
          <CodeBlock>{quickStart}</CodeBlock>
          <Prose>
            Both servers start with automatic TLS via Caddy (included in the
            Docker Compose stack).
          </Prose>
        </Section>

        <Section title="Verify it works">
          <CodeBlock>{verify}</CodeBlock>
        </Section>

        <Section title="Connect the app">
          <Prose>
            Open Khord on your phone → during setup, choose &quot;Use custom
            servers&quot; → enter your server URLs. You can also change servers
            later in Settings.
          </Prose>
        </Section>

        <Section title="Architecture overview">
          <BulletList
            items={[
              "Key Server: stores public keys, handles key exchange. Knows identity but not conversations.",
              "Relay Server: routes encrypted messages via per-contact mailboxes. Knows nothing about identity.",
              "Both servers use PostgreSQL for storage (included in the Docker Compose stack).",
              "The servers share zero state — no database, no network, no secrets in common.",
            ]}
          />
        </Section>

        <Section title="Deployment options">
          <div className="rounded-xl border border-border bg-surface px-6 py-5">
            <h3 className="mb-2 text-base font-semibold text-fg">
              Option A: Single machine (simplest)
            </h3>
            <Prose>
              Both servers on one machine with the included Docker Compose file.
              Good for personal use or small teams.
            </Prose>
          </div>
          <div className="rounded-xl border border-border bg-surface px-6 py-5">
            <h3 className="mb-2 text-base font-semibold text-fg">
              Option B: Split deployment (recommended for organizations)
            </h3>
            <Prose>
              Key Server and Relay Server on separate machines or separate
              hosting providers. Maximizes the split-trust benefit — compromising
              one machine doesn&apos;t compromise the other. See{" "}
              <code className={inlineCode}>
                deploy/docker-compose.coolify.keyserver.yml
              </code>{" "}
              and{" "}
              <code className={inlineCode}>
                deploy/docker-compose.coolify.relayserver.yml
              </code>{" "}
              in the repo.
            </Prose>
          </div>
          <div className="rounded-xl border border-border bg-surface px-6 py-5">
            <h3 className="mb-2 text-base font-semibold text-fg">
              Option C: Mix and match
            </h3>
            <Prose>
              Run your own Relay Server (for metadata control) while using the
              community Key Server, or vice versa. The servers are independent —
              any combination works.
            </Prose>
          </div>
        </Section>

        <Section title="Maintenance">
          <BulletList
            items={[
              <>
                <strong className="font-semibold text-fg">Updates:</strong>{" "}
                <code className={inlineCode}>
                  git pull &amp;&amp; docker compose up -d --build
                </code>{" "}
                — pull the latest code, rebuild, restart.
              </>,
              <>
                <strong className="font-semibold text-fg">Backups:</strong> Back
                up the PostgreSQL data volumes. The Key Server&apos;s data is
                public keys (recoverable from clients). The Relay Server&apos;s
                data is encrypted blobs (ephemeral by design, deleted after
                delivery or TTL).
              </>,
              <>
                <strong className="font-semibold text-fg">Monitoring:</strong>{" "}
                Both servers expose <code className={inlineCode}>/v1/health</code>{" "}
                endpoints. Point your uptime monitor at them.
              </>,
            ]}
          />
        </Section>

        <Section title="Federation discovery (coming soon)">
          <Prose>
            A planned feature will let you publish a{" "}
            <code className={inlineCode}>/.well-known/khord.json</code> file on
            your domain so users can find your servers by typing just your domain
            name instead of two separate URLs.
          </Prose>
        </Section>

        <Section title="Need help?">
          <BulletList
            items={[
              <>
                Deployment guide in the repo:{" "}
                <a
                  href="https://github.com/Khord-Project/khord/tree/main/deploy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link}
                >
                  github.com/Khord-Project/khord/tree/main/deploy
                </a>
              </>,
              <>
                Architecture decisions:{" "}
                <a
                  href="https://github.com/Khord-Project/khord/tree/main/docs/decisions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link}
                >
                  github.com/Khord-Project/khord/tree/main/docs/decisions
                </a>
              </>,
              <>
                Report issues:{" "}
                <a
                  href="https://github.com/Khord-Project/khord/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link}
                >
                  github.com/Khord-Project/khord/issues
                </a>
              </>,
            ]}
          />
        </Section>
      </main>

      <Footer />
    </div>
  );
}
