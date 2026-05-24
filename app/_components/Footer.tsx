import Link from "next/link";

export function Footer() {
  const links: { label: string; href: string; external?: boolean }[] = [
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Changelog", href: "/changelog" },
    { label: "Commitment", href: "/commitment" },
    {
      label: "GitHub",
      href: "https://github.com/Khord-Project/khord",
      external: true,
    },
    {
      label: "Protocol",
      href: "https://github.com/Khord-Project/khord/blob/main/docs/PROTOCOL.md",
      external: true,
    },
    {
      label: "Roadmap",
      href: "https://github.com/orgs/Khord-Project/projects/1",
      external: true,
    },
  ];
  return (
    <footer className="border-t border-border-subtle px-6 py-12 text-center">
      <p className="font-serif text-[15px] italic text-fg-dim">
        Privacy should be structural, not just promised.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3">
        {links.map(({ label, href, external }) =>
          external ? (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-fg-dim transition-colors hover:text-fg-muted"
            >
              {label}
            </a>
          ) : (
            <Link
              key={label}
              href={href}
              className="text-[13px] text-fg-dim transition-colors hover:text-fg-muted"
            >
              {label}
            </Link>
          ),
        )}
      </div>
    </footer>
  );
}
