import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col">
      {/* Minimal nav */}
      <header className="border-b border-[#e8e4de] bg-white px-4 sm:px-8 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-75 transition-opacity">
          <Image src="/logo.png" alt="Sniffer" width={24} height={24} />
          <span className="font-semibold text-[18px] tracking-tight text-[#0a0a0a]">sniffer</span>
        </Link>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Forensic frame */}
        <div
          className="relative mb-10 rounded-2xl border border-[#e8e4de] bg-white overflow-hidden"
          style={{ width: "100%", maxWidth: "480px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 40px rgba(0,0,0,0.06)" }}
        >
          {/* Top accent */}
          <div className="h-1 w-full bg-[#0a0a0a]" />

          <div className="px-8 py-10">
            {/* Case header row */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-1">
                  Sniffer · Forensic Case Report
                </p>
                <p className="font-mono text-[17px] font-bold text-[#0a0a0a] tracking-tight">
                  SNF‑2026‑0000‑404
                </p>
                <p className="font-mono text-[10.5px] text-[#a8a29e] mt-0.5">
                  Routing anomaly detected
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8a29e]">Verdict</p>
                <p className="font-mono text-[13px] font-bold uppercase tracking-wide text-red-600 mt-0.5">
                  Not Found
                </p>
                <p className="font-mono text-[9.5px] text-[#a8a29e] mt-0.5">
                  0/7 layers resolved
                </p>
              </div>
            </div>

            {/* Error code */}
            <div className="mb-6">
              <p
                className="font-mono font-black leading-none text-center select-none"
                style={{ fontSize: "5.5rem", color: "#f0ede8", letterSpacing: "-0.04em" }}
              >
                404
              </p>
            </div>

            {/* Analysis summary */}
            <div className="rounded-lg border border-[#f0ede8] bg-[#fafaf8] px-4 py-3 mb-6 text-left">
              <p className="font-mono text-[9.5px] uppercase tracking-widest text-[#a8a29e] mb-2">Analysis Summary</p>
              <p className="text-[12.5px] text-[#6b7280] leading-relaxed">
                The requested URL could not be located in the routing manifest.
                No forensic evidence was found at this path. The page may have
                been moved, deleted, or never existed.
              </p>
            </div>

            {/* Signal rows */}
            {[
              { label: "URL Resolution", status: "FAILED", flag: true },
              { label: "Route Manifest Match", status: "NOT FOUND", flag: true },
              { label: "Redirect Lookup", status: "NO MATCH", flag: true },
              { label: "Content Delivery", status: "ABORTED", flag: true },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2.5 border-t border-[#f4f1ed] first:border-t-0"
              >
                <span className="text-[12px] text-[#374151]">{row.label}</span>
                <span className="font-mono text-[10.5px] font-semibold text-red-500 uppercase tracking-wide">
                  {row.status}
                </span>
              </div>
            ))}
          </div>

          {/* Document footer */}
          <div className="border-t border-[#e8e4de] bg-[#fafaf8] px-8 py-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#c4bdb5]">SHA-256</p>
              <p className="font-mono text-[10.5px] text-[#c4bdb5] mt-0.5">null · no content hashed</p>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#c4bdb5]">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Signed · no evidence
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium hover:bg-[#1a1a1a] transition-colors"
          >
            ← Return to Home
          </Link>
          <Link
            href="/start"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#e8e4de] bg-white text-[13px] font-medium text-[#374151] hover:border-[#0a0a0a] transition-colors"
          >
            Start Investigation
          </Link>
        </div>

        <p className="font-mono text-[10.5px] text-[#c4bdb5]">
          SNIFFER · IMPIC LABS · 2026
        </p>
      </main>
    </div>
  );
}
