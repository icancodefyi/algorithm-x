import Link from "next/link";

export function CTASection() {
  return (
    <section className="w-full bg-[#0a0a0a] py-32">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 sm:px-8 text-center">

        {/* Eyebrow */}
        <p className="mb-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4b4742]">
          Get Started
        </p>

        {/* Headline */}
        <h2
          className="mb-7 font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight text-white"
          style={{ maxWidth: "640px" }}
        >
          Your image deserves<br />a forensic answer.
        </h2>

        <p className="mb-12 text-[16px] leading-[1.75] text-[#6b7280]" style={{ maxWidth: "400px" }}>
          Upload once. No account. Receive a cryptographically signed report in under 60 seconds.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/start"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-[#0a0a0a] transition-opacity hover:opacity-85"
          >
            Start an Investigation
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/protect"
            className="rounded-full border border-[#2a2a2a] px-7 py-3.5 text-[14px] font-medium text-[#9ca3af] transition-colors hover:border-[#4b4742] hover:text-white"
          >
            Protect Your Images
          </Link>
        </div>

        {/* Bottom trust line */}
        <p className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono text-[11px] text-[#3a3632]">
          <span>Private by default</span>
          <span aria-hidden="true" className="inline-block h-px w-3 bg-[#2a2a2a]" />
          <span>No personal data stored</span>
          <span aria-hidden="true" className="inline-block h-px w-3 bg-[#2a2a2a]" />
          <span>Anonymous reports supported</span>
        </p>

      </div>
    </section>
  );
}
