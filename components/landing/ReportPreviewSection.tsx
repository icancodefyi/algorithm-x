const LAYERS = [
  { name: "Error-Level Analysis",       score: 94, flag: true  },
  { name: "EXIF Metadata Integrity",    score: 12, flag: false },
  { name: "GAN Artifact Detection",     score: 87, flag: true  },
  { name: "Facial Landmark Distortion", score: 78, flag: true  },
  { name: "Clone Region Mapping",       score: 31, flag: false },
  { name: "Noise Pattern Analysis",     score: 91, flag: true  },
  { name: "Compression Fingerprinting", score: 66, flag: true  },
];

const flagCount = LAYERS.filter((l) => l.flag).length;

export function ReportPreviewSection() {
  return (
    <section id="report" className="w-full bg-[#fafaf8] py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">

        <div className="grid grid-cols-1 items-start gap-20 lg:grid-cols-[1fr_500px]">

          {/* ── Left ── */}
          <div className="flex flex-col justify-center lg:py-8">
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a8a29e]">
              Evidence Output
            </p>
            <h2
              className="mb-6 font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight text-[#0a0a0a]"
              style={{ maxWidth: "440px" }}
            >
              Every case produces a signed forensic record.
            </h2>
            <p className="mb-12 text-[16px] leading-[1.75] text-[#6b7280]" style={{ maxWidth: "380px" }}>
              Per-layer confidence scores, anomaly annotations, and a
              cryptographic case ID — formatted to meet platform
              takedown and legal filing standards.
            </p>

            {/* Three stats — no bullets, data speaks */}
            <div className="grid grid-cols-3 border-t border-[#e8e4de]">
              {[
                { value: "7",        label: "Analysis\nlayers" },
                { value: "SHA-256",  label: "Hash\nalgorithm" },
                { value: "< 60s",    label: "Report\ngeneration" },
              ].map((s, i) => (
                <div
                  key={s.value}
                  className={`py-6 ${i > 0 ? "pl-6" : ""} ${i < 2 ? "pr-6 border-r border-[#e8e4de]" : ""}`}
                >
                  <p className="font-mono text-[22px] font-semibold text-[#0a0a0a]">{s.value}</p>
                  <p className="mt-1 text-[12px] leading-snug text-[#a8a29e] whitespace-pre-line">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: document-style report ── */}
          <div>
            {/*
              Designed to look like a real forensic document, not a dashboard card.
              - Thick top accent border (indigo)
              - Monospaced header block like a legal letterhead
              - Table-style analysis rows with column alignment
              - Verdict as a stern label, not a playful badge
            */}
            <div
              className="overflow-hidden rounded-xl bg-white"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 40px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)" }}
            >
              {/* Top accent rule */}
              <div className="h-0.75 w-full bg-indigo-600" />

              {/* Document header */}
              <div className="border-b border-[#ede9e3] px-8 py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#a8a29e]">
                      Sniffer · Forensic Case Report
                    </p>
                    <p className="mt-2 font-mono text-[20px] font-bold tracking-tight text-[#0a0a0a]">
                      SNF‑2026‑0312‑XK7
                    </p>
                    <p className="mt-1 font-mono text-[11.5px] text-[#a8a29e]">
                      Issued 05 Mar 2026 · 14:32:07 UTC
                    </p>
                  </div>

                  {/* Verdict — stern, not playful */}
                  <div className="text-right">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8a29e]">Verdict</p>
                    <p className="mt-1 font-mono text-[15px] font-bold uppercase tracking-wide text-red-700">
                      Manipulated
                    </p>
                    <p className="mt-1 font-mono text-[10.5px] text-[#a8a29e]">
                      {flagCount}/{LAYERS.length} layers flagged
                    </p>
                  </div>
                </div>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_52px_80px] border-b border-[#ede9e3] px-8 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c4bdb5]">Layer</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c4bdb5] text-right">Score</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c4bdb5] text-right">Status</span>
              </div>

              {/* Analysis rows */}
              <ul className="divide-y divide-[#f4f1ed] px-8">
                {LAYERS.map((l) => (
                  <li key={l.name} className="grid grid-cols-[1fr_52px_80px] items-center gap-2 py-3.5">
                    {/* Name + thin bar */}
                    <div>
                      <p className="text-[13px] font-medium text-[#1a1a1a]">{l.name}</p>
                      <div className="mt-1.5 h-px w-full bg-[#ede9e3]">
                        <div
                          className={l.flag ? "h-px bg-red-400" : "h-px bg-[#c4bdb5]"}
                          style={{ width: `${l.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Score — mono, right-aligned */}
                    <span className={`font-mono text-[13px] font-semibold text-right tabular-nums ${l.flag ? "text-red-600" : "text-[#6b7280]"}`}>
                      {l.score}
                    </span>

                    {/* Status label */}
                    <span className={`text-right font-mono text-[10.5px] font-semibold uppercase tracking-wide ${l.flag ? "text-red-500" : "text-[#a8a29e]"}`}>
                      {l.flag ? "Flagged" : "Clean"}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Document footer */}
              <div className="border-t border-[#ede9e3] bg-[#fafaf8] px-8 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c4bdb5]">SHA-256</p>
                    <p className="mt-0.5 font-mono text-[11.5px] text-[#6b7280]">a3f8d2c0…1b9e74f3</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-[#a8a29e]">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Cryptographically signed
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center font-mono text-[11px] text-[#c4bdb5]">
              Sample · actual case data is private by default
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
