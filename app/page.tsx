"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";

type Status = "online" | "offline" | "error" | "checking";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links: [string, string][] = [
    ["Architecture", "#architecture"],
    ["Self-Host", "#selfhost"],
    ["Status", "#status"],
    ["Open Source", "#opensource"],
  ];

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-6 transition-all duration-300 ${
        scrolled
          ? "border-b border-border-subtle bg-[rgba(10,15,15,0.92)] backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt="Khord logo"
          width={32}
          height={32}
          priority
          className="h-8 w-8"
        />
        <span className="font-serif text-xl tracking-wide text-fg">Khord</span>
      </div>
      <div className="flex items-center gap-7">
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="hidden text-sm font-medium text-fg-muted transition-colors hover:text-fg sm:inline"
          >
            {label}
          </a>
        ))}
        <a
          href="https://github.com/Khord-Project/khord"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-accent px-[18px] py-2 text-sm font-semibold text-bg transition-colors hover:bg-accent-dim"
        >
          GitHub
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-32 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[20%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(26,83,92,0.08) 0%, transparent 70%)",
        }}
      />
      <FadeIn>
        <Image
          src="/logo.png"
          alt="Khord logo"
          width={96}
          height={96}
          priority
          className="mb-8 h-24 w-24"
        />
      </FadeIn>
      <FadeIn delay={0.05}>
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
          <span className="text-[13px] text-fg-muted">
            Proof of Concept — under active development
          </span>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <h1 className="mb-6 max-w-[720px] font-serif text-[clamp(40px,7vw,72px)] font-normal leading-[1.08] text-fg">
          Privacy by{" "}
          <span className="bg-gradient-to-br from-primary-glow to-accent bg-clip-text text-transparent">
            Architecture
          </span>
        </h1>
      </FadeIn>
      <FadeIn delay={0.2}>
        <p className="mb-12 max-w-[560px] text-[clamp(16px,2.5vw,20px)] leading-[1.65] text-fg-muted">
          Encrypted messaging where no single server sees the full picture. Two
          independent servers, each holding half the puzzle. Neither can
          reconstruct the whole.
        </p>
      </FadeIn>
      <FadeIn delay={0.3}>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#architecture"
            className="rounded-[10px] bg-gradient-to-br from-primary to-primary-light px-8 py-3.5 text-base font-semibold text-white shadow-[0_4px_24px_#1A535C40] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_#1A535C60]"
          >
            How it works
          </a>
          <a
            href="https://github.com/Khord-Project/khord"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[10px] border border-border bg-surface px-8 py-3.5 text-base font-semibold text-fg transition-colors duration-200 hover:border-primary-light hover:bg-surface-hover"
          >
            View source
          </a>
        </div>
      </FadeIn>
    </section>
  );
}

function ServerCard({
  title,
  subtitle,
  items,
  accent,
  delay,
}: {
  title: string;
  subtitle: string;
  items: string[];
  accent: string;
  delay: number;
}) {
  const icon =
    title === "Key Server" ? "🔑" : title === "Relay Server" ? "📮" : "📱";

  return (
    <FadeIn delay={delay} className="flex-[1_1_300px]">
      <div
        className="h-full rounded-2xl border border-border bg-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--card-accent)]"
        style={{ "--card-accent": accent } as CSSProperties}
      >
        <div
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-[10px] border text-lg"
          style={{ background: `${accent}18`, borderColor: `${accent}30` }}
        >
          {icon}
        </div>
        <h3 className="mb-1.5 font-serif text-[22px] font-normal text-fg">
          {title}
        </h3>
        <p className="mb-[18px] text-sm font-medium" style={{ color: accent }}>
          {subtitle}
        </p>
        <div className="flex flex-col gap-2.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className="flex-shrink-0 text-base leading-[22px]"
                style={{ color: accent }}
              >
                ✓
              </span>
              <span className="text-sm leading-[22px] text-fg-muted">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

function Architecture() {
  return (
    <section
      id="architecture"
      className="mx-auto max-w-[960px] px-6 py-[100px]"
    >
      <FadeIn>
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-glow">
          Split-Trust Architecture
        </p>
        <h2 className="mb-4 font-serif text-[clamp(28px,5vw,40px)] font-normal leading-tight text-fg">
          Two servers. Neither sees the full picture.
        </h2>
        <p className="mb-12 max-w-[640px] text-[17px] leading-[1.7] text-fg-muted">
          The Key Server knows your identity but not your conversations. The
          Relay Server routes your messages but not your identity. Connecting
          the dots requires compromising both independently — and the
          architecture is designed so that doesn&apos;t happen.
        </p>
      </FadeIn>
      <div className="flex flex-wrap gap-5">
        <ServerCard
          title="Key Server"
          subtitle="Identity Layer"
          accent="#3AAFBF"
          delay={0.1}
          items={[
            "Stores public encryption keys",
            "Handles initial key exchange (X3DH)",
            "Knows nothing about messages or mailboxes",
            "Can be shared across communities",
          ]}
        />
        <ServerCard
          title="Relay Server"
          subtitle="Transport Layer"
          accent="#F4A261"
          delay={0.2}
          items={[
            "Routes sealed, encrypted messages",
            "Per-contact mailboxes — unlinkable",
            "Knows nothing about user identities",
            "Messages deleted after delivery",
          ]}
        />
        <ServerCard
          title="Your Device"
          subtitle="The Only Place Secrets Live"
          accent="#4ADE80"
          delay={0.3}
          items={[
            "All encryption and decryption happens here",
            "Private keys never leave the device",
            "Seed phrase recovery — no accounts",
            "Panic button: instant, total wipe",
          ]}
        />
      </div>
    </section>
  );
}

function Features() {
  const rows = [
    {
      icon: "🔐",
      title: "Signal Protocol encryption",
      desc: "X3DH key agreement + Double Ratchet. Every message has its own key. Forward secrecy and post-compromise recovery. The same proven cryptography Signal uses.",
    },
    {
      icon: "📱",
      title: "No account required",
      desc: "Your identity is a cryptographic key, generated from a seed phrase on your device. No phone number. No email. No username. The servers don't know who you are.",
    },
    {
      icon: "👁️",
      title: "Per-contact mailboxes",
      desc: "Every conversation uses its own dedicated mailbox. The server can't tell which mailboxes belong to the same person or the same conversation.",
    },
    {
      icon: "🔴",
      title: "Panic button",
      desc: "One tap destroys everything — identity, contacts, messages, encryption keys. The database key is erased from secure hardware. Forensic recovery gets unreadable ciphertext.",
    },
    {
      icon: "🔔",
      title: "Real-time notifications",
      desc: "WebSocket push — no Google Play Services, no third-party push servers observing your notification timing. The most private notification path available.",
    },
    {
      icon: "🎨",
      title: "Yours to customize",
      desc: "Three color themes. Light and dark modes. Runtime server selection. Every component is open source and yours to modify.",
    },
  ];
  return (
    <section className="mx-auto max-w-[640px] px-6 py-20">
      <FadeIn>
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-accent">
          Built Different
        </p>
        <h2 className="mb-10 font-serif text-[clamp(28px,5vw,36px)] font-normal text-fg">
          Privacy isn&apos;t a feature. It&apos;s the architecture.
        </h2>
      </FadeIn>
      {rows.map(({ icon, title, desc }, i) => (
        <FadeIn key={title} delay={0.05 + i * 0.05}>
          <div className="flex gap-5 border-b border-border-subtle py-6">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-xl">
              {icon}
            </div>
            <div>
              <h3 className="mb-1 text-base font-semibold text-fg">{title}</h3>
              <p className="text-sm leading-[1.6] text-fg-muted">{desc}</p>
            </div>
          </div>
        </FadeIn>
      ))}
    </section>
  );
}

function Download() {
  return (
    <section id="download" className="px-6 py-20">
      <div className="relative mx-auto max-w-[800px] overflow-hidden rounded-[20px] border border-border bg-surface p-[clamp(32px,5vw,56px)] text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-[120px] -left-[100px] h-[320px] w-[320px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(244,162,97,0.10) 0%, transparent 70%)",
          }}
        />
        <FadeIn>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-accent">
            Download
          </p>
          <h2 className="mb-8 font-serif text-[clamp(28px,5vw,40px)] font-normal leading-tight text-fg">
            Get Khord
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <a
            href="https://github.com/Khord-Project/khord/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-[10px] bg-gradient-to-br from-primary to-primary-light px-8 py-3.5 text-base font-semibold text-white shadow-[0_4px_24px_#1A535C40] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_#1A535C60]"
          >
            Download APK
          </a>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="mx-auto mt-6 max-w-[480px] text-sm leading-[1.6] text-fg-muted">
            Android 8.0+ required. Sideload instructions: download the APK,
            open it, and allow installation from unknown sources when prompted.
          </p>
        </FadeIn>
        <FadeIn delay={0.25}>
          <p className="mt-4 text-sm text-fg-dim">
            F-Droid listing coming soon. iOS is on the roadmap.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="mx-auto mt-10 max-w-[560px] rounded-xl border border-border-subtle bg-bg-subtle px-[22px] py-[18px] text-left">
            <p className="text-[13px] leading-[1.6] text-fg-muted">
              Khord is in early development and has not been professionally
              security-audited. Use community servers for casual testing,
              self-host for anything sensitive.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function SelfHost() {
  const tiers = [
    {
      label: "Organizations",
      desc: "Run both servers on your infrastructure. Communication metadata never leaves your network.",
    },
    {
      label: "Individuals",
      desc: "Use community servers to get started. Self-host your Relay Server with one Docker command for full metadata control.",
    },
    {
      label: "The bigger picture",
      desc: "Non-profits, universities, governments — anyone can operate servers. No permission needed. The more operators, the more resilient the network.",
    },
  ];
  return (
    <section id="selfhost" className="px-6 py-20">
      <div className="relative mx-auto max-w-[800px] overflow-hidden rounded-[20px] border border-border bg-surface p-[clamp(32px,5vw,56px)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[100px] -top-[100px] h-[300px] w-[300px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(26,83,92,0.07) 0%, transparent 70%)",
          }}
        />
        <FadeIn>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-glow">
            Self-Hosting
          </p>
          <h2 className="mb-5 font-serif text-[clamp(26px,5vw,36px)] font-normal leading-tight text-fg">
            Your servers. Your rules.
          </h2>
          <p className="mb-8 max-w-[540px] text-base leading-[1.7] text-fg-muted">
            If you can run a Docker container, you can run a Khord server. The
            community servers at keys.khord.org and relay.khord.org are a
            starting point — not the destination.
          </p>
        </FadeIn>
        <div className="flex flex-col gap-4">
          {tiers.map(({ label, desc }, i) => (
            <FadeIn key={label} delay={0.1 + i * 0.1}>
              <div className="rounded-xl border border-border-subtle bg-bg-subtle px-[22px] py-[18px]">
                <span className="text-sm font-semibold text-accent">
                  {label}
                </span>
                <p className="mt-1.5 text-sm leading-[1.6] text-fg-muted">
                  {desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServerStatus() {
  const [keyStatus, setKeyStatus] = useState<Status>("checking");
  const [relayStatus, setRelayStatus] = useState<Status>("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const check = async (url: string, setter: (s: Status) => void) => {
      try {
        const res = await fetch(url, { mode: "cors" });
        const data = await res.json();
        setter(data.status === "ok" ? "online" : "error");
      } catch {
        setter("offline");
      }
    };
    const runChecks = () => {
      check("https://keys.khord.org/v1/health", setKeyStatus);
      check("https://relay.khord.org/v1/health", setRelayStatus);
      setLastChecked(new Date());
    };
    runChecks();
    const interval = setInterval(runChecks, 60000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status: Status) =>
    status === "online"
      ? "#4ADE80"
      : status === "checking"
        ? "#5E7676"
        : "#EF4444";

  const statusLabel = (status: Status) =>
    status === "online"
      ? "Operational"
      : status === "checking"
        ? "Checking..."
        : "Unreachable";

  const rows: [string, string, Status][] = [
    ["Key Server", "keys.khord.org", keyStatus],
    ["Relay Server", "relay.khord.org", relayStatus],
  ];

  return (
    <section
      id="status"
      className="mx-auto max-w-[480px] px-6 pb-20 pt-10"
    >
      <FadeIn>
        <div className="rounded-2xl border border-border-subtle bg-surface px-7 py-6">
          <div className="mb-[18px] flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">
              Community Server Status
            </p>
            {lastChecked && (
              <span className="text-[11px] text-fg-dim">
                Updated{" "}
                {lastChecked.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          {rows.map(([name, host, status], i) => (
            <div
              key={name}
              className={`flex items-center justify-between py-2.5 ${
                i > 0 ? "border-t border-border-subtle" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full transition-all duration-300"
                  style={{
                    background: statusColor(status),
                    boxShadow:
                      status === "online"
                        ? "0 0 8px rgba(74,222,128,0.4)"
                        : "none",
                  }}
                />
                <div>
                  <span className="block text-sm font-medium text-fg">
                    {name}
                  </span>
                  <span className="text-xs text-fg-dim">{host}</span>
                </div>
              </div>
              <span
                className="text-[13px] font-medium"
                style={{ color: statusColor(status) }}
              >
                {statusLabel(status)}
              </span>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function OpenSource() {
  const links = [
    {
      label: "Protocol Spec",
      href: "https://github.com/Khord-Project/khord/blob/main/docs/PROTOCOL.md",
    },
    {
      label: "Architecture Decisions",
      href: "https://github.com/Khord-Project/khord/tree/main/docs/decisions",
    },
    {
      label: "Deployment Guide",
      href: "https://github.com/Khord-Project/khord/tree/main/deploy",
    },
  ];
  return (
    <section
      id="opensource"
      className="mx-auto max-w-[640px] px-6 py-20 text-center"
    >
      <FadeIn>
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-glow">
          Open Source
        </p>
        <h2 className="mb-5 font-serif text-[clamp(28px,5vw,36px)] font-normal text-fg">
          Verify, don&apos;t trust.
        </h2>
        <p className="mb-9 text-base leading-[1.7] text-fg-muted">
          Server code is AGPL-3.0 — modified versions must publish their
          changes. The protocol specification is CC-BY-SA-4.0 — anyone can
          build a compatible client. The architecture enforces privacy. The
          source code proves it.
        </p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="flex flex-wrap justify-center gap-3">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:border-primary-light hover:text-fg"
            >
              {label}
            </a>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  const links: [string, string][] = [
    ["GitHub", "https://github.com/Khord-Project/khord"],
    [
      "Protocol",
      "https://github.com/Khord-Project/khord/blob/main/docs/PROTOCOL.md",
    ],
  ];
  return (
    <footer className="border-t border-border-subtle px-6 py-12 text-center">
      <p className="font-serif text-[15px] italic text-fg-dim">
        Privacy should be structural, not just promised.
      </p>
      <div className="mt-5 flex justify-center gap-6">
        {links.map(([label, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-fg-dim transition-colors hover:text-fg-muted"
          >
            {label}
          </a>
        ))}
      </div>
    </footer>
  );
}

export default function KhordLanding() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Nav />
      <Hero />
      <Architecture />
      <Features />
      <Download />
      <SelfHost />
      <ServerStatus />
      <OpenSource />
      <Footer />
    </div>
  );
}
