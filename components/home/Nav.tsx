"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { label: "Work", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Journey", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
        scrolled
          ? "border-b border-signal/10 bg-void/70 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 font-mono text-[11px] uppercase tracking-[0.25em]">
        <Link href="/" className="text-ink transition-colors hover:text-signal">
          <span className="hidden sm:inline">Signal from Noise</span>
          <span className="sm:hidden">SFN</span>
        </Link>
        <ul className="flex items-center gap-5 sm:gap-8">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-mute transition-colors hover:text-ink">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
