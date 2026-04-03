"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/components/i18n/LanguageProvider";

const NAV = [
  {
    group: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Analysis layers", href: "/#features" },
      { label: "Evidence report", href: "/#report" },
    ],
  },
  {
    group: "Use Cases",
    links: [
      { label: "Deepfake verification", href: "/start" },
      { label: "NCII leak discovery", href: "/leak" },
      { label: "Image protection", href: "/protect" },
      { label: "Supported platforms", href: "/supported-platforms" },
    ],
  },
  {
    group: "Resources",
    links: [
      { label: "Blog & guides", href: "/resources" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Supported platforms", href: "/supported-platforms" },
    ],
  },
];

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="w-full border-t border-[#1a1a1a] bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-16">
        {/* Top row: logo + nav columns */}
        <div className="grid grid-cols-2 gap-12 md:grid-cols-[1fr_repeat(3,auto)]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Image src="/logo.png" alt="Sniffer" width={28} height={28} />
              <span className="text-[20px] font-semibold tracking-tight text-white">
                sniffer
              </span>
            </div>
            <p
              className="mb-6 text-[14px] leading-[1.65] text-[#4b4742]"
              style={{ maxWidth: "260px" }}
            >
              {t.footer.tagline}
            </p>
            <p className="font-mono text-[11px] text-[#2a2725]">
              Anonymous by default · No stored images
            </p>
          </div>

          {/* Nav column groups */}
          {NAV.map((col) => (
            <div key={col.group}>
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3a3632]">
                {col.group}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13.5px] text-[#6b6560] transition-colors hover:text-[#a8a29e]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-[#1a1a1a] pt-8 md:flex-row md:items-center">
          <p className="font-mono text-[11.5px] text-[#2a2725]">
            © 2026 Sniffer · ImpicLabs
          </p>
          <p className="font-mono text-[11px] text-[#2a2725]">
            Built for journalists, legal teams, and anyone who deserves the
            truth.
          </p>
        </div>
      </div>
    </footer>
  );
}
