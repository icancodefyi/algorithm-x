import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "How It Works — Sniffer",
  description:
    "A detailed walkthrough of Sniffer's forensic image verification pipeline — from upload to signed evidence report.",
};

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */

const PROCESS_STEPS = [
  {
    n: "01",
    phase: "Intake",
    title: "Create a verification case",
    desc: "Begin by providing basic context — where you found the image, the issue type, and your privacy preference. No account is required. Anonymous submissions are fully supported.",
    bullets: [
      "Choose your privacy mode: named or anonymous",
      "Select the platform where the image was found",
      "Describe the suspected harm or manipulation",
      "A unique Case ID is generated for your session",
    ],
    mono: "Case ID generated · no identity required",
    color: "#6366f1",
    bg: "#eef2ff",
  },
  {
    n: "02",
    phase: "Upload",
    title: "Upload the suspicious image",
    desc: "Your image is SHA-256 hashed at the boundary before anything else runs. The hash becomes the immutable identifier for the entire forensic chain. A reference image may optionally be provided for comparative analysis.",
    bullets: [
      "JPEG, PNG, WEBP supported — up to 20 MB",
      "File is hashed immediately on receipt",
      "Optional: provide a reference image for comparison",
      "Thumbnail cached in your session only — never retained server-side",
    ],
    mono: "SHA-256 · hash-first architecture · file discarded post-analysis",
    color: "#0ea5e9",
    bg: "#f0f9ff",
  },
  {
    n: "03",
    phase: "Analysis",
    title: "Seven-layer forensic pipeline runs",
    desc: "All analysis layers execute concurrently. Each layer operates independently — no single layer controls the verdict. Results are weighted and aggregated into a composite authenticity score.",
    bullets: [
      "All layers run in parallel, typically within 30–60 seconds",
      "Each layer produces a confidence value and binary flag",
      "Weighted scoring algorithm combines all signals",
      "C2PA provenance manifest parsed if present",
    ],
    mono: "30–60s · 7 concurrent analysis modules",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    n: "04",
    phase: "Report",
    title: "Signed forensic report generated",
    desc: "A structured evidence document is produced containing per-layer scores, detected anomaly regions, a forensic narrative, and a cryptographically derived case hash. The report is formatted to meet platform takedown filing and legal exhibit standards.",
    bullets: [
      "Per-layer confidence scores with status flags",
      "Annotated tamper heatmap and ELA overlay",
      "Natural-language forensic explanation",
      "SHA-256 report hash for chain-of-custody integrity",
    ],
    mono: "Tamper-evident hash · printable PDF · platform-ready",
    color: "#22c55e",
    bg: "#f0fdf4",
  },
];

const ANALYSIS_LAYERS = [
  {
    tag: "Error Level",
    abbr: "ELA",
    title: "Error-Level Analysis",
    desc: "Re-saves the image at a known JPEG quality and measures per-pixel deviation from the original. Edited regions compress differently — their ELA residuals stand out as bright regions against a uniform noise floor.",
    tech: "JPEG re-compression differential · 95% quality baseline",
    flags: "Identifies splicing, cloning, and object insertion",
    color: "#ef4444",
  },
  {
    tag: "Metadata",
    abbr: "EXIF",
    title: "EXIF Metadata Forensics",
    desc: "Parses all embedded metadata fields including camera model, software IDs, GPS coordinates, creation timestamps, and colour profiles. Missing, forged, or inconsistent tags are primary manipulation indicators.",
    tech: "ExifTool extraction · 200+ field analysis · software tag matching",
    flags: "Detects edited timestamps, absent GPS, conflicting software chains",
    color: "#6366f1",
  },
  {
    tag: "AI Detection",
    abbr: "GAN",
    title: "GAN Artifact Detection",
    desc: "Analyses the frequency spectrum and spatial domain for statistical patterns unique to neural network output — checkerboard artifacts, spectral peaks at regular intervals, and texture distributions inconsistent with camera optics.",
    tech: "FFT spectrum analysis · CNN classifier · spectral fingerprinting",
    flags: "Identifies AI-generated faces, backgrounds, and full composites",
    color: "#8b5cf6",
  },
  {
    tag: "Biometric",
    abbr: "LMKS",
    title: "Facial Landmark Distortion",
    desc: "Maps 68 facial key-points and measures geometric deviation from anatomically valid proportions. Deepfake generators and face-swap tools introduce measurable asymmetries at the bone structure level.",
    tech: "dlib 68-point predictor · Procrustes deviation scoring",
    flags: "Flags unnatural jaw alignment, eye asymmetry, and skin-boundary blur",
    color: "#f97316",
  },
  {
    tag: "Structural",
    abbr: "CRM",
    title: "Clone Region Mapping",
    desc: "Detects copy-move forgery — where a region of the image is duplicated and pasted elsewhere to cover or add content. Uses block-matching across keypoint descriptors to find near-identical regions.",
    tech: "SIFT / ORB keypoint matching · affine transform clustering",
    flags: "Common in document fraud, scene manipulation, and object removal",
    color: "#0ea5e9",
  },
  {
    tag: "Sensor",
    abbr: "PRNU",
    title: "Noise Pattern Analysis",
    desc: "Every camera sensor has a unique photon-response non-uniformity (PRNU) noise fingerprint. Composited image regions break this field — the foreign pixels carry a different sensor signature.",
    tech: "Wavelet denoising · PRNU extraction · cross-correlation mapping",
    flags: "Detects multi-source compositing even after JPEG recompression",
    color: "#14b8a6",
  },
  {
    tag: "Compression",
    abbr: "DCT",
    title: "DCT Compression Fingerprinting",
    desc: "JPEG images store data as discrete cosine transform (DCT) coefficients. Re-saved or edited regions have double-quantised coefficients — a statistical ghost of the editing tool's compression pass.",
    tech: "DCT histogram analysis · quantisation grid detection · double-JPEG identification",
    flags: "Reveals local re-saves, region upscaling, and steganographic modification",
    color: "#f59e0b",
  },
];

const REPORT_SECTIONS = [
  {
    label: "Case Metadata",
    icon: "◈",
    items: ["Case ID and platform source", "Submission timestamp · UTC", "Issue type and privacy mode", "SHA-256 file hash"],
  },
  {
    label: "Forensic Verdict",
    icon: "◎",
    items: ["Authenticity score (0–100)", "High-confidence verdict label", "Certainty level declaration", "Flagged layer count"],
  },
  {
    label: "Layer Results",
    icon: "◑",
    items: ["Per-layer confidence score", "Binary flag (clean / anomalous)", "Weighted signal contribution", "Algorithm version reference"],
  },
  {
    label: "Visual Evidence",
    icon: "◐",
    items: ["ELA residual heatmap", "Tamper region bounding boxes", "Keypoint distortion overlay", "Comparative reference panel"],
  },
  {
    label: "C2PA Provenance",
    icon: "◉",
    items: ["Manifest issuer and signer", "Generator tool declaration", "Cryptographic signature status", "AI origin assertion label"],
  },
  {
    label: "Audit Trail",
    icon: "◈",
    items: ["Pipeline version and hash", "Processing timestamps", "Module execution log", "Report integrity hash"],
  },
];

const PRIVACY_ITEMS = [
  {
    title: "Image never stored",
    body: "Your file is hashed on arrival and discarded immediately after analysis. The report references the hash — not the file.",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
      </svg>
    ),
  },
  {
    title: "Anonymous by default",
    body: "No email, account, or identity is required. Anonymous cases receive full forensic analysis — indistinguishable from attributed ones.",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /><line x1="18" y1="9" x2="22" y2="9" />
      </svg>
    ),
  },
  {
    title: "Tamper-evident report hash",
    body: "The forensic output is itself hashed — any modification to the report after generation changes the hash, invalidating it as evidence.",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "No personal data retained",
    body: "Session thumbnails are stored in your browser only. No IP address, device identifier, or browsing pattern is logged.",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-white border-b border-[#e8e4de] pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-5">
            How It Works
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div style={{ maxWidth: "640px" }}>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-[#0a0a0a] mb-6">
                From pixel to proof —<br />the complete forensic pipeline.
              </h1>
              <p className="text-[16px] leading-[1.75] text-[#6b7280]">
                Sniffer runs a seven-layer forensic analysis on every image submitted. Each layer operates
                independently. The results are weighted, scored, and assembled into a cryptographically
                signed evidence report — formatted for platform takedown filings, legal exhibits, and
                personal records.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <div className="grid grid-cols-3 border border-[#e8e4de] rounded-xl overflow-hidden">
                {[
                  { v: "7", l: "Analysis\nlayers" },
                  { v: "<60s", l: "Report\ntime" },
                  { v: "0", l: "Account\nrequired" },
                ].map((s, i) => (
                  <div
                    key={s.v}
                    className={`px-5 py-4 bg-[#fafaf8] text-center ${i < 2 ? "border-r border-[#e8e4de]" : ""}`}
                  >
                    <p className="font-mono text-[22px] font-bold text-[#0a0a0a] tabular-nums">{s.v}</p>
                    <p className="font-mono text-[10px] text-[#a8a29e] mt-1 whitespace-pre-line">{s.l}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/start"
                className="w-full text-center py-3 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium hover:bg-[#1a1a1a] transition-colors"
              >
                Start Investigation →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process Steps ── */}
      <section className="py-24 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-3">
            Verification Process
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-16" style={{ maxWidth: "480px" }}>
            Four steps from submission to signed report.
          </h2>

          <div className="space-y-0">
            {PROCESS_STEPS.map((step, i) => (
              <div
                key={step.n}
                className="grid grid-cols-1 lg:grid-cols-[80px_1fr_1fr] gap-0 border-t border-[#e8e4de] py-12 last:border-b"
              >
                {/* Number */}
                <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-0 mb-6 lg:mb-0">
                  <span
                    className="font-mono text-[2.8rem] font-light leading-none select-none"
                    style={{ color: "#e8e4de" }}
                  >
                    {step.n}
                  </span>
                  <span
                    className="font-mono text-[9.5px] uppercase tracking-[0.2em] px-2 py-0.5 rounded"
                    style={{ color: step.color, background: step.bg, border: `1px solid ${step.color}22` }}
                  >
                    {step.phase}
                  </span>
                </div>

                {/* Title + description */}
                <div className="lg:pr-12 mb-6 lg:mb-0">
                  <h3 className="text-[1.25rem] font-semibold text-[#0a0a0a] mb-3 leading-snug">{step.title}</h3>
                  <p className="text-[14px] leading-[1.75] text-[#6b7280] mb-4">{step.desc}</p>
                  <p
                    className="font-mono text-[10.5px] px-3 py-1.5 rounded-lg inline-block"
                    style={{ background: step.bg, color: step.color }}
                  >
                    {step.mono}
                  </p>
                </div>

                {/* Bullets */}
                <div className="rounded-xl border border-[#e8e4de] bg-white px-5 py-5">
                  <p className="font-mono text-[9.5px] uppercase tracking-widest text-[#a8a29e] mb-4">
                    What happens
                  </p>
                  <ul className="space-y-3">
                    {step.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: step.color }}
                        />
                        <span className="text-[13px] text-[#374151] leading-snug">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Forensic Analysis Layers ── */}
      <section className="py-24 bg-white border-t border-b border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-3">
            Analysis Engine
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-tight tracking-tight text-[#0a0a0a]" style={{ maxWidth: "520px" }}>
              Seven independent forensic layers. One composite verdict.
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#6b7280]" style={{ maxWidth: "300px" }}>
              Each layer is designed to catch a different class of manipulation. A determined forgery rarely defeats all seven simultaneously.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-px bg-[#e8e4de]">
            {ANALYSIS_LAYERS.map((layer, i) => (
              <div key={layer.title} className="bg-white p-8 flex flex-col gap-4">
                {/* Tag + abbr */}
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-widest"
                    style={{ color: layer.color, background: `${layer.color}14` }}
                  >
                    {layer.abbr}
                  </span>
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#a8a29e]">
                    {layer.tag}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-[#d4cfc9]">
                    {String(i + 1).padStart(2, "0")}/07
                  </span>
                </div>

                {/* Title + description */}
                <div>
                  <h3 className="text-[17px] font-semibold text-[#0a0a0a] mb-2 leading-snug">
                    {layer.title}
                  </h3>
                  <p className="text-[13.5px] leading-[1.7] text-[#6b7280]">{layer.desc}</p>
                </div>

                {/* Tech + flags */}
                <div className="mt-auto pt-4 border-t border-[#f0ede8] space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-[9.5px] uppercase text-[#c4bdb5] tracking-wide shrink-0 pt-px">Tech</span>
                    <span className="font-mono text-[10.5px] text-[#9ca3af]">{layer.tech}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-[9.5px] uppercase text-[#c4bdb5] tracking-wide shrink-0 pt-px">Flags</span>
                    <span className="font-mono text-[10.5px]" style={{ color: layer.color }}>{layer.flags}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Evidence Report Anatomy ── */}
      <section className="py-24 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-3">
            Evidence Output
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-tight tracking-tight text-[#0a0a0a]" style={{ maxWidth: "480px" }}>
              What the forensic report contains.
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#6b7280]" style={{ maxWidth: "300px" }}>
              Structured for platform abuse teams, legal professionals, and survivors who need verifiable documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {REPORT_SECTIONS.map((sec) => (
              <div key={sec.label} className="rounded-xl border border-[#e8e4de] bg-white px-5 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[18px] text-[#c4bdb5] font-mono">{sec.icon}</span>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#a8a29e]">{sec.label}</p>
                </div>
                <ul className="space-y-2">
                  {sec.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#d4cfc9] mt-2 shrink-0" />
                      <span className="text-[12.5px] text-[#374151]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Report chain-of-custody callout */}
          <div className="rounded-2xl bg-[#0a0a0a] px-8 py-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="flex-1">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#4b4742] mb-3">
                Chain of Custody
              </p>
              <h3 className="text-[1.2rem] font-semibold text-white mb-2">
                The report hash is derived from the forensic output — not your image.
              </h3>
              <p className="text-[13.5px] text-[#6b7280] leading-relaxed">
                SHA-256 is computed over the analysis results JSON. Any alteration to the report after generation changes the hash, which invalidates the document as evidence. This design means your original file is mathematically excluded from the evidence chain entirely.
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-[#1a1a1a] bg-[#111] p-5 font-mono text-[11px] text-[#4b4742] space-y-1.5 min-w-0 w-full md:w-auto">
              <p><span className="text-[#6366f1]">hash</span> = SHA256(analysis_results)</p>
              <p><span className="text-[#6366f1]">report_id</span> = SNF‑{"{"}case_id{"}"}</p>
              <p><span className="text-[#6366f1]">image_ref</span> = SHA256(file_bytes)</p>
              <p><span className="text-[#6366f1]">stored</span> = hash only · no pixels</p>
              <p className="pt-1 text-[#2a2a2a]">─────────────────────</p>
              <p><span className="text-emerald-600">integrity</span> = verifiable · tamper-evident</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Protect Registry ── */}
      <section className="py-24 bg-white border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-emerald-600 mb-3">
                Protection Registry
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-5">
                Register your originals before they're misused.
              </h2>
              <p className="text-[14.5px] leading-[1.75] text-[#6b7280] mb-8">
                Upload original images to compute and store their cryptographic fingerprint. If the same image is ever submitted through the verification pipeline, it is automatically flagged as matching a registered original — creating an immutable paper trail of ownership.
              </p>
              <div className="space-y-5">
                {[
                  { step: "01", title: "Upload your original", body: "We compute a SHA-256 hash and perceptual image fingerprint. The image itself is never retained — only the mathematical proof." },
                  { step: "02", title: "Fingerprint registered", body: "Your hash is written to the protection registry. Any identical or near-identical image uploaded for verification will automatically match against your entry." },
                  { step: "03", title: "Match detected", body: "When a match is found, the forensic report flags the image with your registry reference ID — giving you cryptographic proof of prior registration." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <span className="font-mono text-[22px] font-light text-[#e8e4de] leading-none mt-1 w-10 shrink-0">{s.step}</span>
                    <div>
                      <p className="text-[14px] font-semibold text-[#0a0a0a] mb-1">{s.title}</p>
                      <p className="text-[13px] text-[#6b7280] leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  href="/protect"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium hover:bg-[#1a1a1a] transition-colors"
                >
                  Register an Image →
                </Link>
              </div>
            </div>

            {/* Visual: mock registry entry */}
            <div className="rounded-xl border border-[#e8e4de] overflow-hidden bg-white">
              <div className="bg-[#f8faf8] border-b border-[#e8e4de] px-5 py-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-[10px] text-emerald-700 uppercase tracking-widest">Registered</span>
                <span className="ml-auto font-mono text-[10px] text-[#c4bdb5]">6 Mar 2026 · 14:32 UTC</span>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-widest text-[#a8a29e] mb-1">Reference ID</p>
                  <p className="font-mono text-[14px] font-bold text-[#0a0a0a]">A3F8D2C0</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-widest text-[#a8a29e] mb-1">SHA-256 Hash</p>
                    <p className="font-mono text-[10.5px] text-[#374151]">a3f8d2c0…1b9e74f3</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-widest text-[#a8a29e] mb-1">Perceptual Hash</p>
                    <p className="font-mono text-[10.5px] text-[#374151]">f7e3c2b1…9a0d5e2f</p>
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <p className="font-mono text-[10px] text-emerald-700 uppercase tracking-widest mb-1">Registry Match</p>
                  <p className="text-[12.5px] text-emerald-800">
                    This image was submitted for verification on 6 Mar 2026 and automatically matched your registration.
                  </p>
                </div>
                <div className="pt-1 border-t border-[#f0ede8]">
                  <p className="font-mono text-[10px] text-[#a8a29e]">Registered pre-dispute · ownership chain established</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Takedown Workflow ── */}
      <section className="py-24 bg-[#fafaf8] border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-indigo-500 mb-3">
            Takedown Workflow
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a]" style={{ maxWidth: "480px" }}>
              From report to removal — in one step.
            </h2>
            <p className="text-[14px] leading-[1.7] text-[#6b7280]" style={{ maxWidth: "320px" }}>
              Platform abuse forms require evidence in specific formats. Sniffer generates compliant takedown notices for all major platforms automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: "01", title: "Upload infringing image", body: "Provide the image you found being misused online. We compute its hash and check the protection registry." },
              { n: "02", title: "Registry check", body: "If a registry match is found, your ownership is cryptographically confirmed and referenced in the notice." },
              { n: "03", title: "Notice generated", body: "A formal DMCA-style takedown notice is generated, pre-populated with your evidence hash and case reference." },
              { n: "04", title: "Submit to platform", body: "The notice links directly to the platform's official abuse reporting form — formatted to their requirements." },
            ].map((s, i) => (
              <div key={s.n} className="rounded-xl border border-[#e8e4de] bg-white p-6 relative">
                <span className="font-mono text-[34px] font-light text-[#f0ede8] leading-none select-none block mb-4">
                  {s.n}
                </span>
                <h3 className="text-[14px] font-semibold text-[#0a0a0a] mb-2">{s.title}</h3>
                <p className="text-[12.5px] text-[#6b7280] leading-relaxed">{s.body}</p>
                {i < 3 && (
                  <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 items-center justify-center">
                    <svg width="12" height="12" fill="none" stroke="#d4cfc9" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/takedown"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium hover:bg-[#1a1a1a] transition-colors"
            >
              Issue a Takedown Notice →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Privacy & Security ── */}
      <section className="py-24 bg-white border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-3">
            Privacy & Security
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-12" style={{ maxWidth: "500px" }}>
            Designed so you never have to trust us with more than you intended.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PRIVACY_ITEMS.map((item) => (
              <div key={item.title} className="flex gap-5">
                <div className="w-10 h-10 rounded-xl bg-[#fafaf8] border border-[#e8e4de] flex items-center justify-center shrink-0 text-[#6b7280]">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#0a0a0a] mb-1.5">{item.title}</h3>
                  <p className="text-[13.5px] leading-[1.7] text-[#6b7280]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col items-center text-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#4b4742] mb-5">
            Start Now
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal leading-[1.1] tracking-tight text-white mb-6" style={{ maxWidth: "560px" }}>
            Ready to run your first forensic analysis?
          </h2>
          <p className="text-[15px] text-[#6b7280] leading-[1.7] mb-10" style={{ maxWidth: "380px" }}>
            No account. No install. Upload your image and receive a signed evidence report in under 60 seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/start"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#0a0a0a] text-[14px] font-semibold hover:opacity-85 transition-opacity"
            >
              Start an Investigation
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center px-7 py-3.5 rounded-full border border-[#2a2a2a] text-[#9ca3af] text-[14px] font-medium hover:border-[#4b4742] hover:text-white transition-colors"
            >
              Read Research Articles
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
