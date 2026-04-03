"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/components/i18n/LanguageProvider";

const HERO_PARTICLES = [
  { left: "72%", top: "16%", size: 6, duration: 4.8, delay: 0.2, color: "rgba(99,102,241,0.52)" },
  { left: "82%", top: "22%", size: 5, duration: 5.2, delay: 1.1, color: "rgba(148,163,184,0.42)" },
  { left: "78%", top: "31%", size: 9, duration: 4.4, delay: 0.6, color: "rgba(79,70,229,0.48)" },
  { left: "88%", top: "35%", size: 6, duration: 5.5, delay: 1.8, color: "rgba(129,140,248,0.52)" },
  { left: "84%", top: "48%", size: 10, duration: 5.8, delay: 0.4, color: "rgba(99,102,241,0.54)" },
  { left: "92%", top: "54%", size: 6, duration: 4.9, delay: 2.1, color: "rgba(203,213,225,0.58)" },
  { left: "79%", top: "61%", size: 6, duration: 4.6, delay: 0.9, color: "rgba(99,102,241,0.48)" },
  { left: "87%", top: "69%", size: 5, duration: 5.4, delay: 1.5, color: "rgba(148,163,184,0.42)" },
  { left: "82%", top: "78%", size: 8, duration: 4.3, delay: 0.7, color: "rgba(79,70,229,0.48)" },
  { left: "90%", top: "84%", size: 6, duration: 5.1, delay: 1.9, color: "rgba(129,140,248,0.5)" },
  { left: "95%", top: "64%", size: 5, duration: 4.7, delay: 1.2, color: "rgba(226,232,240,0.68)" },
];

const CYBORG_TRACES = [
  "M 258 104 L 316 104 L 316 132 L 364 132",
  "M 278 168 L 344 168 L 344 212 L 396 212",
  "M 246 236 L 304 236 L 304 274 L 358 274",
  "M 286 308 L 338 308 L 338 356 L 390 356",
  "M 268 392 L 324 392 L 324 430 L 372 430",
  "M 302 142 L 302 92 L 346 92",
  "M 332 252 L 382 252 L 382 298",
];

export function HeroSection() {
  const { t } = useTranslation();
  const STATS = [
    { value: "99.2%", label: t.hero.stat1Label },
    { value: "<60s", label: t.hero.stat2Label },
    { value: "SHA-256", label: t.hero.stat3Label },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-white">

      {/* Two-column grid */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-72px)] w-full max-w-[1200px] grid-cols-1 items-center px-4 pt-20 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(460px,40%)] lg:gap-10 lg:px-8 lg:pt-24 lg:pb-20">

        {/* Left copy */}
        <div className="flex flex-col justify-center py-10 lg:py-0">

          {/* Ornament */}
          <div aria-hidden="true" className="mb-6 flex items-center gap-3 opacity-50">
            <svg width="50" height="34" viewBox="0 0 50 34" fill="none">
              <path d="M46 6C38 2 25 2 21 12C17 22 25 31 34 29C43 27 45 18 39 14C33 10 24 14 26 21" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="26" cy="21" r="1.5" fill="#818cf8" />
            </svg>
            <svg width="50" height="34" viewBox="0 0 50 34" fill="none" className="-scale-x-100">
              <path d="M46 6C38 2 25 2 21 12C17 22 25 31 34 29C43 27 45 18 39 14C33 10 24 14 26 21" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="26" cy="21" r="1.5" fill="#818cf8" />
            </svg>
          </div>

          {/* Badge */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[12.5px] font-medium text-indigo-600 shadow-[0_0_0_1px_rgba(99,102,241,0.22),0_2px_10px_rgba(0,0,0,0.06)]">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-indigo-400" />
              {t.hero.badge}
            </span>
          </div>

          {/* H1 — font-serif maps to Georgia; text-5xl (48px) guarantees 2 lines in this column */}
          <h1 className="mb-5 font-serif text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-[#0a0a0a]">
            {t.hero.heading1}
            <br />
            {t.hero.heading2}
          </h1>

          {/* Sub-copy */}
          <p className="mb-8 max-w-xl text-[17px] leading-[1.7] text-[#6b7280]">
            {t.hero.body}
          </p>

          {/* CTAs */}
          <div className="mb-4 flex flex-wrap gap-3">
            <Link
              href="/start"
              className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-75"
            >
              {t.hero.ctaPrimary}
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center rounded-full border border-[#e0d8d0] bg-white px-6 py-3 text-sm font-medium text-[#3d3530] transition-colors hover:border-indigo-400 hover:text-indigo-600"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#b0a89e]">
            <span>{t.hero.trust1}</span>
            <span aria-hidden="true" className="inline-block h-px w-3.5 bg-[#e0dbd5]" />
            <span>{t.hero.trust2}</span>
            <span aria-hidden="true" className="inline-block h-px w-3.5 bg-[#e0dbd5]" />
            <span>{t.hero.trust3}</span>
          </div>
        </div>

        {/* Right illustration */}
        <div className="hero-illustration-enter relative hidden h-full min-h-[560px] overflow-hidden rounded-l-[48px] bg-white lg:block">
          <div
            className="absolute inset-0"
            style={{
              maskImage:
                "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 79%, rgba(0,0,0,0.72) 90%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 79%, rgba(0,0,0,0.72) 90%, rgba(0,0,0,0) 100%)",
            }}
          >
            <div className="absolute inset-0 bg-white" />
            <Image
              src="/illustration.png"
              alt="Split-face: authentic photo left, deepfake forensic breakdown right"
              fill
              priority
              sizes="(min-width: 1280px) 38vw, (min-width: 1024px) 40vw, 100vw"
              className="object-cover object-[90%_14%] scale-[1.1]"
            />
          </div>

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              maskImage:
                "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 79%, rgba(0,0,0,0.72) 90%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 79%, rgba(0,0,0,0.72) 90%, rgba(0,0,0,0) 100%)",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_34%,rgba(255,255,255,0.92),transparent_42%)]" />

            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(17,24,39,0.1),rgba(17,24,39,0.8),rgba(17,24,39,0.1))]" />

            <motion.div
              aria-hidden="true"
              className="absolute left-0 right-0 h-px bg-[#111827]/80 shadow-[0_0_18px_rgba(99,102,241,0.35)]"
              animate={{ top: ["8%", "92%", "8%"] }}
              transition={{ duration: 6.4, ease: "linear", repeat: Infinity }}
            />

            <svg
              aria-hidden="true"
              viewBox="0 0 460 560"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
            >
              {CYBORG_TRACES.map((trace, index) => (
                <g key={trace}>
                  <motion.path
                    d={trace}
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.22)"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0.2, opacity: 0.18 }}
                    animate={{ pathLength: [0.18, 1, 0.25], opacity: [0.12, 0.5, 0.16] }}
                    transition={{ duration: 3.4 + index * 0.25, repeat: Infinity, ease: "easeInOut", delay: index * 0.18 }}
                  />
                  <motion.path
                    d={trace}
                    fill="none"
                    stroke="rgba(129, 140, 248, 0.95)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeDasharray="5 18"
                    vectorEffect="non-scaling-stroke"
                    animate={{ strokeDashoffset: [0, -46], opacity: [0.24, 0.92, 0.3] }}
                    transition={{ duration: 2.1 + index * 0.18, repeat: Infinity, ease: "linear" }}
                  />
                </g>
              ))}
            </svg>

            {[
              { left: "66%", top: "18%" },
              { left: "78%", top: "29%" },
              { left: "72%", top: "41%" },
              { left: "84%", top: "53%" },
              { left: "75%", top: "67%" },
            ].map((node, index) => (
              <motion.span
                key={`${node.left}-${node.top}`}
                aria-hidden="true"
                className="absolute h-2 w-2 rounded-full border border-indigo-400/70 bg-white/90 shadow-[0_0_16px_rgba(129,140,248,0.5)]"
                style={{ left: node.left, top: node.top }}
                animate={{ scale: [0.9, 1.45, 0.95], opacity: [0.45, 1, 0.5] }}
                transition={{ duration: 2 + index * 0.22, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
              />
            ))}

            <div
              className="absolute inset-0"
              style={{
                maskImage: "linear-gradient(90deg, transparent 0%, transparent 58%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,1) 84%)",
                WebkitMaskImage: "linear-gradient(90deg, transparent 0%, transparent 58%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,1) 84%)",
              }}
            >
              {HERO_PARTICLES.map((particle) => (
                <motion.span
                  key={`${particle.left}-${particle.top}`}
                  aria-hidden="true"
                  className="absolute rounded-full"
                  style={{
                    left: particle.left,
                    top: particle.top,
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    boxShadow: `0 0 14px ${particle.color}`,
                  }}
                  animate={{
                    y: [-8, 8, -8],
                    opacity: [0.15, 0.68, 0.2],
                    scale: [0.92, 1.14, 0.95],
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>

          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-[22%]"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 72%, rgba(255,255,255,1) 100%)",
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40"
            style={{ background: "linear-gradient(to bottom, transparent, #fff)" }}
          />
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative z-10 border-t border-[#f0ece6] bg-[#fafaf9]">
        <dl className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-[#f0ece6] px-0">
          {STATS.map((s) => (
            <div key={s.label} className="px-3 sm:px-8 py-5 sm:py-6 text-center">
              <dt className="mb-0.5 text-lg sm:text-xl font-semibold tracking-tight text-[#0a0a0a]">
                {s.value}
              </dt>
              <dd className="text-xs text-[#9ca3af]">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
