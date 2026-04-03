"use client";
import Link from "next/link";
import { useTranslation } from "@/components/i18n/LanguageProvider";

/*
 * Hero illustration (right column) was previously a large block with
 * next/image (/illustration.png), framer-motion particles, and SVG traces.
 * To restore it, search git history for "hero-illustration-enter" or "illustration.png".
 */

export function HeroSection() {
  const { t } = useTranslation();
  const STATS = [
    { value: "99.2%", label: t.hero.stat1Label },
    { value: "<60s", label: t.hero.stat2Label },
    { value: "SHA-256", label: t.hero.stat3Label },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-72px)] w-full max-w-7xl flex-col justify-center px-4 pt-28 pb-20 sm:px-8 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28">
        <div className="hero-text-enter mx-auto flex w-full max-w-4xl flex-col items-center text-center lg:max-w-5xl">
          <div aria-hidden="true" className="mb-8 flex justify-center gap-4 opacity-45 sm:mb-10">
            <svg width="56" height="38" viewBox="0 0 50 34" fill="none" className="sm:h-10 sm:w-18">
              <path d="M46 6C38 2 25 2 21 12C17 22 25 31 34 29C43 27 45 18 39 14C33 10 24 14 26 21" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="26" cy="21" r="1.5" fill="#818cf8" />
            </svg>
            <svg width="56" height="38" viewBox="0 0 50 34" fill="none" className="-scale-x-100 sm:h-10 sm:w-18">
              <path d="M46 6C38 2 25 2 21 12C17 22 25 31 34 29C43 27 45 18 39 14C33 10 24 14 26 21" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="26" cy="21" r="1.5" fill="#818cf8" />
            </svg>
          </div>

          <div className="mb-8 flex justify-center sm:mb-10">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2 text-sm font-medium text-indigo-600 shadow-[0_0_0_1px_rgba(99,102,241,0.22),0_2px_10px_rgba(0,0,0,0.06)]">
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-400" />
              {t.hero.badge}
            </span>
          </div>

          <h1 className="mb-8 text-balance font-serif text-[2.125rem] font-medium leading-[1.06] tracking-[-0.02em] text-[#0a0a0a] sm:mb-10 sm:text-5xl sm:leading-[1.05] md:text-6xl md:leading-[1.03] lg:text-7xl lg:leading-[1.02]">
            {t.hero.heading1}
            <br />
            {t.hero.heading2}
          </h1>

          <p className="mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-[#6b7280] sm:mb-12 sm:text-xl sm:leading-[1.65]">
            {t.hero.body}
          </p>

          <div className="mb-8 flex w-full flex-col items-stretch justify-center gap-4 sm:mb-10 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              href="/start"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#0a0a0a] px-9 py-4 text-base font-medium text-white transition-opacity hover:opacity-75"
            >
              {t.hero.ctaPrimary}
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-[#e0d8d0] bg-white px-9 py-4 text-base font-medium text-[#3d3530] transition-colors hover:border-indigo-400 hover:text-indigo-600"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>

          <div className="flex max-w-md flex-col items-center gap-2.5 text-sm leading-relaxed text-[#b0a89e] sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-1">
            <span>{t.hero.trust1}</span>
            <span aria-hidden="true" className="hidden h-px w-3.5 shrink-0 bg-[#e0dbd5] sm:inline-block" />
            <span>{t.hero.trust2}</span>
            <span aria-hidden="true" className="hidden h-px w-3.5 shrink-0 bg-[#e0dbd5] sm:inline-block" />
            <span>{t.hero.trust3}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-[#e8e4de] bg-[#fafaf9]">
        <dl className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-[#e8e4de] px-4 sm:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="py-8 text-center sm:py-10">
              <dt className="mb-1 text-2xl font-semibold tracking-tight text-[#0a0a0a] sm:text-3xl">
                {s.value}
              </dt>
              <dd className="mx-auto max-w-36 text-sm leading-snug text-[#9ca3af]">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
