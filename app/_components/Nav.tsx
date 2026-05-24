"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type NavLink = { label: string; href: string; external?: boolean };

const links: NavLink[] = [
  { label: "Architecture", href: "/#architecture" },
  { label: "Self-Host", href: "/self-host" },
  { label: "Status", href: "/#status" },
  { label: "FAQ", href: "/faq" },
  { label: "Threat Model", href: "/threat-model" },
  { label: "Blog", href: "/blog" },
];

function NavItem({
  link,
  className,
  onClick,
}: {
  link: NavLink;
  className: string;
  onClick?: () => void;
}) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className} onClick={onClick}>
      {link.label}
    </Link>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const solid = scrolled || open;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "border-b border-border-subtle bg-[rgba(10,15,15,0.92)] backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo.png"
            alt="Khord logo"
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-full"
          />
          <span className="font-serif text-xl tracking-wide text-fg">
            Khord
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 sm:flex">
          {links.map((link) => (
            <NavItem
              key={link.href}
              link={link}
              className="text-sm font-medium text-fg-muted transition-colors hover:text-fg"
            />
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

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-fg transition-colors hover:bg-surface-hover sm:hidden"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="border-t border-border-subtle px-6 py-4 sm:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavItem
                key={link.href}
                link={link}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
              />
            ))}
            <a
              href="https://github.com/Khord-Project/khord"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-accent px-3 py-3 text-center text-base font-semibold text-bg transition-colors hover:bg-accent-dim"
            >
              GitHub
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
