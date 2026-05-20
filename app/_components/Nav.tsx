"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links: [string, string][] = [
    ["Architecture", "/#architecture"],
    ["Self-Host", "/#selfhost"],
    ["Status", "/#status"],
    ["Blog", "/blog"],
  ];

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-6 transition-all duration-300 ${
        scrolled
          ? "border-b border-border-subtle bg-[rgba(10,15,15,0.92)] backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt="Khord logo"
          width={32}
          height={32}
          priority
          className="h-8 w-8 rounded-full"
        />
        <span className="font-serif text-xl tracking-wide text-fg">Khord</span>
      </Link>
      <div className="flex items-center gap-7">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="hidden text-sm font-medium text-fg-muted transition-colors hover:text-fg sm:inline"
          >
            {label}
          </Link>
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
