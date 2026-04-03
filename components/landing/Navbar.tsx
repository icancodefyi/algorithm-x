"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

type NavItem = {
  id: string;
  key: NavKey;
  href: string;
  label?: string;
};

type NavKey =
  | "howItWorks"
  | "resources"
  | "dashboard"
  | "supportedPlatforms";

const NAV_HREFS: NavItem[] = [
  { id: "how-it-works", key: "howItWorks", href: "/how-it-works" },
  { id: "resources", key: "resources", href: "/resources" },
  { id: "supported-platforms", key: "supportedPlatforms", href: "/supported-platforms", label: "Platforms" },
];




export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled || menuOpen ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled || menuOpen ? "blur(16px) saturate(1.8)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
      }}
    >
      <nav
        className="flex items-center justify-between px-4 sm:px-8 py-4"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Sniffer" width={28} height={28} />
          <span
            className="text-[21px] font-semibold tracking-tight"
            style={{ color: "#0a0a0a" }}
          >
            sniffer
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_HREFS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-0.5 text-[12.5px] font-medium transition-colors hover:text-[#0a0a0a]"
              style={{ color: "#7a7268", letterSpacing: "0.04em" }}
            >
           {item.label || t.nav[item.key as keyof typeof t.nav]}

              <span className="text-[9px] ml-0.5" style={{ color: "#b0a89e" }}>›</span>
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2.5">
          <LanguageSwitcher />
          <Link
            href="/start"
            className="px-5 py-2 rounded-full text-[13px] font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: "#0a0a0a" }}
          >
            {t.nav.startVerification}
          </Link>
        </div>

        {/* Mobile: verify CTA + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            href="/start"
            className="px-4 py-1.5 rounded-full text-[12px] font-medium text-white"
            style={{ background: "#0a0a0a" }}
          >
            {t.nav.verify}
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 flex flex-col items-center justify-center gap-1.5"
          >
            <span
              className={`block h-px w-5 bg-[#0a0a0a] transition-all duration-200 origin-center ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-5 bg-[#0a0a0a] transition-all duration-200 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-px w-5 bg-[#0a0a0a] transition-all duration-200 origin-center ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div
          className="md:hidden border-t bg-white px-6 py-5 flex flex-col"
          style={{ borderColor: "rgba(0,0,0,0.06)" }}
        >
          {NAV_HREFS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="py-3.5 text-[13px] font-medium border-b last:border-0 transition-colors hover:text-[#0a0a0a]"
              style={{
                color: "#5a5248",
                letterSpacing: "0.04em",
                borderColor: "#f0ede8",
              }}
            >
          {item.label || t.nav[item.key as keyof typeof t.nav]}

            </Link>
          ))}
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/start"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center py-3 rounded-full text-[13px] font-medium text-white"
              style={{ background: "#0a0a0a" }}
            >
              {t.nav.startVerification}
            </Link>
            <div className="flex justify-center pt-1">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
