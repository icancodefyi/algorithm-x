import Link from "next/link";

const AUDIENCES = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    tag: "Individuals",
    title: "Victims of image-based abuse",
    desc:
      "Someone used an intimate or manipulated image of you without consent. You need verifiable evidence — not a screenshot, not a claim. A cryptographically signed forensic report that platforms, law enforcement, and courts can act on.",
    cta: "Start anonymous case",
    href: "/leak",
    accent: "text-rose-600",
    border: "border-rose-100",
    bg: "bg-rose-50",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        <path d="M17 11l2 2 4-4" />
      </svg>
    ),
    tag: "Trust & Safety",
    title: "Platform abuse teams",
    desc:
      "Your queue is in the millions. Our API returns a machine-readable verdict in under 30 seconds — with a weighted signal breakdown and SHA-256 audit hash your team can append directly to moderation decisions.",
    cta: "Start verification",
    href: "/start",
    accent: "text-indigo-600",
    border: "border-indigo-100",
    bg: "bg-indigo-50",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    tag: "Journalism",
    title: "Fact-checkers & newsrooms",
    desc:
      "Viral images move faster than editorial cycles. Verify source integrity before publication — ELA residuals, C2PA provenance, and perceptual hash consensus surfaced in one report your legal team can cite.",
    cta: "Try a verification",
    href: "/start",
    accent: "text-amber-600",
    border: "border-amber-100",
    bg: "bg-amber-50",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M3 6h18M3 12h18M3 18h18" />
        <circle cx="20" cy="6" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
    tag: "Legal",
    title: "Solicitors & law enforcement",
    desc:
      "Chain-of-custody integrity starts at first contact with evidence. Every Sniffer report includes a tamper-evident report hash, pipeline version, and full algorithm audit trail — suitable for submission as digital exhibit.",
    cta: "View sample report",
    href: "/#report",
    accent: "text-teal-600",
    border: "border-teal-100",
    bg: "bg-teal-50",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    tag: "Institutions",
    title: "NGOs & advocacy organisations",
    desc:
      "Document image-based harassment at scale. Batch API access, anonymous case IDs, and exportable reports make Sniffer a fit for survivor support programmes and policy research alike.",
    cta: "Start a case",
    href: "/start",
    accent: "text-violet-600",
    border: "border-violet-100",
    bg: "bg-violet-50",
  },
];

const TRUST_MARKS = [
  { label: "No account required", icon: "○" },
  { label: "Anonymous by default", icon: "○" },
  { label: "Report is tamper-evident", icon: "○" },
  { label: "No images stored", icon: "○" },
  { label: "SHA-256 audit trail", icon: "○" },
];

export function AudienceSection() {
  return (
    <section className="w-full bg-[#fafaf8] py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">

        {/* Header */}
        <div className="mb-20 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a8a29e]">
              Who is Sniffer for?
            </p>
            <h2
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight text-[#0a0a0a]"
              style={{ maxWidth: "480px" }}
            >
              Built for everyone<br />who needs the truth.
            </h2>
          </div>
          <div style={{ maxWidth: "280px" }}>
            <p className="text-[15px] leading-[1.7] text-[#6b7280]">
              From individuals protecting themselves, to institutions operating at scale —
              the same forensic engine, the same institutional-grade report.
            </p>
          </div>
        </div>

        {/* Cards grid — 3+2 layout */}
        <div className="grid grid-cols-1 gap-px bg-[#e8e4de] sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((a) => (
            <div
              key={a.tag}
              className="group flex flex-col bg-white p-8 transition-shadow duration-200 hover:shadow-sm"
            >
              {/* Icon + tag */}
              <div className="mb-6 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.bg} ${a.accent}`}>
                  {a.icon}
                </div>
                <span className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] ${a.accent}`}>
                  {a.tag}
                </span>
              </div>

              {/* Content */}
              <h3 className="mb-3 text-[19px] font-semibold leading-snug text-[#0a0a0a]">
                {a.title}
              </h3>
              <p className="mb-8 flex-1 text-[14.5px] leading-[1.75] text-[#6b7280]">
                {a.desc}
              </p>

              {/* CTA */}
              <Link
                href={a.href}
                className={`group/link inline-flex items-center gap-1.5 text-[13px] font-semibold ${a.accent} transition-opacity hover:opacity-70`}
              >
                {a.cta}
                <svg
                  width="11"
                  height="11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  className="transition-transform duration-150 group-hover/link:translate-x-0.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}

          {/* Trust marks tile — fills 6th slot in 3-col grid */}
          <div className="flex flex-col justify-between bg-[#0a0a0a] p-8 sm:col-span-2 lg:col-span-1">
            <div>
              <p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#4b4742]">
                Privacy &amp; Trust
              </p>
              <h3 className="mb-6 font-serif text-[28px] font-normal leading-snug text-white">
                Your report.<br />Your evidence.
              </h3>
            </div>

            <ul className="flex flex-col gap-3">
              {TRUST_MARKS.map((t) => (
                <li key={t.label} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] text-[10px] text-[#4b4742]">
                    ✓
                  </span>
                  <span className="text-[13.5px] text-[#9ca3af]">{t.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-[#1a1a1a] pt-6">
              <p className="text-[12px] leading-relaxed text-[#4b4742]">
                Sniffer never stores the image after analysis. The report hash is derived from
                the forensic output, not the original file.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
